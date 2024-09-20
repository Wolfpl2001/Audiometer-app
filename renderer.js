$(document).ready(function() {
  $("#audioDiagram").prop('disabled', true);
  $("#direction").prop('disabled', true);
  $("#download").prop('disabled', true);

  // Here, when an audio file is selected
  $("#audioFile").click(async function() {
    const result = await window.electron.uploadAudioFile();
    if (!result.canceled) {
      console.log('File uploaded:', result.filePaths);
      $("#audioDiagram").prop('disabled', false);
    }
  });

  // Here the audio diagram button is clicked
  $("#audioDiagram").click(function() {
    console.log('Audio diagram selected');
    $("#direction").prop('disabled', false);
  });

  $("#direction").click(function() {
    console.log('Direction selected');
    $("#download").prop('disabled', false);
  });

  $("#download").click(function() {
    console.log('Download started');
  });
});

// Adding functionality to draw the audio waveform on canvas
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('audioFileInput');  // Ensure you have an input element with id 'audioFileInput'
  const canvas = document.getElementById('waveformCanvas');  // Ensure you have a canvas element with id 'waveformCanvas'
  const canvasCtx = canvas.getContext('2d');

  fileInput.addEventListener('change', async () => {
    if (fileInput.files.length === 0) {
      return; // No file, exit
    }

    const file = fileInput.files[0];
    const filePath = file.path;

    try {
      // Generate waveform and get image path
      const { imagePath } = await window.electron.getAudioWaveform(filePath);

      // Clear the canvas
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Load and draw the new waveform image
      const waveformImage = new Image();
      waveformImage.src = imagePath;
      waveformImage.onload = () => {
        canvasCtx.drawImage(waveformImage, 0, 0, canvas.width, canvas.height);
      };
    } catch (error) {
      console.error('Error generating audio waveform:', error);
    }
  });
});

// Example handling of XML file selection
document.getElementById('openFileBtn').addEventListener('click', () => {
  window.electron.send('open-file-dialog'); // Use window.electron.send
});

window.electron.on('file-data', (event, data) => {
  console.log('Selected file:', data.filePath);
  console.log('File content:', data.content);

  parseXML(data.content, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
    } else {
      const extractedData = extractFrequencyData(result);
      console.log('Extracted frequency data:', extractedData);

      drawChart(extractedData);
      document.getElementById('processAudioBtn').disabled = false;
    }
  });
});



function parseXML(xmlString, callback) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    callback(null, xmlDoc);
  } catch (err) {
    callback(err, null);
  }
}

function extractFrequencyData(parsedXml) {
  const parametersNode = parsedXml.getElementsByTagName('Parameters')[0];
  if (!parametersNode) {
    console.error('Parameters node not found in XML');
    return { leftEar: [], rightEar: [] };
  }

  const parameters = parametersNode.textContent;
  const lines = parameters.split('\n').filter(line => line.trim() !== '');

  const leftEar = [];
  const rightEar = [];

  const half = Math.floor(lines.length / 2);

  lines.forEach((line, index) => {
    if (/^[\d\s.-]+$/.test(line)) {
      const matches = line.match(/(\d+)\s(\d+)\s(\d+(\.\d+)?)\s(\d+)\s(\d+)/);
      if (matches) {
        const value = parseFloat(matches[3]);
        const frequency = parseInt(matches[5]);

        if (index < (half - 1)) {
          leftEar.push([value, frequency]);
        } else {
          rightEar.push([value, frequency]);
        }
      }
    }
  });

  const sortAndRemoveDuplicates = (data) => {
    return data.sort((a, b) => a[1] - b[1]).filter((item, index, self) =>
      index === self.findIndex((t) => t[1] === item[1])
    );
  };

  const sortedLeftEar = sortAndRemoveDuplicates(leftEar);
  const sortedRightEar = sortAndRemoveDuplicates(rightEar);

  return { leftEar: sortedLeftEar, rightEar: sortedRightEar };
}

function drawChart(frequencies) {
  const ctx = document.getElementById('frequencyChart').getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  const leftEarLabels = frequencies.leftEar.map(f => f[1]);
  const leftEarData = frequencies.leftEar.map(f => f[0]);
  const rightEarLabels = frequencies.rightEar.map(f => f[1]);
  const rightEarData = frequencies.rightEar.map(f => f[0]);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: leftEarLabels,
      datasets: [
        {
          label: 'Left Ear Frequencies',
          data: leftEarData,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Right Ear Frequencies',
          data: rightEarData,
          borderColor: 'rgba(192, 75, 75, 1)',
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Frequencies (Hz)' } },
        y: { title: { display: true, text: 'Values (dB)' } }
      }
    }
  });
}
