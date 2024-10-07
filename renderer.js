$(document).ready(function() {
  $("#audiodiagram").prop('disabled', true);
  $("#richting").prop('disabled', true);
  $("#downoload").prop('disabled', true);

  // Trigger when an audio file is selected
  $("#audiobestand").click(async function() {
    const result = await window.electron.uploadAudioFile();
    if (!result.canceled) {
      const filePath = result.filePath;
  
      // Generowanie wykresu fali dźwiękowej
      const waveformPath = await window.electron.generateWaveform(filePath);
      console.log('Waveform saved to:', waveformPath);
  
      // Wyświetlenie obrazu w HTML
      const waveformImage = document.getElementById('waveformImage');
      waveformImage.src = `file://${waveformPath}`;
      waveformImage.style.display = 'block';  // Upewnij się, że obraz jest widoczny
    }
  });
  

  // Trigger when an audio diagram is selected
  $("#audiodiagram").click(function() {
    console.log('Audiodiagram gekozen');
    $("#richting").prop('disabled', false);
  });

  $("#richting").click(function() {
    console.log('Richting gekozen');
    $("#downoload").prop('disabled', false);
  });

  $("#downoload").click(function() {
    console.log('Download gestart');
  });
});

// Handle file dialog
document.getElementById('openFileBtn').addEventListener('click', () => {
  window.electron.send('open-file-dialog');
});

// Handle parsed file data
window.electron.on('file-data', (event, data) => {
  parseXML(data.content, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
    } else {
      const extractedData = extractFrequencyData(result);
      drawChart(extractedData);
      document.getElementById('processAudioBtn').disabled = false;
    }
  });
});

// Handle audio processing
document.getElementById('processAudioBtn').addEventListener('click', () => {
  window.electron.send('process-audio');
});

// Handle processed audio feedback
window.electron.on('audio-processed', (event, message) => {
  alert(message);
});

// XML parsing function
function parseXML(xmlString, callback) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    callback(null, xmlDoc);
  } catch (err) {
    callback(err, null);
  }
}

// Extract frequency data from XML
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
      } else {
        console.log('No matches for line:', line);
      }
    } else {
      console.log('Line ignored:', line);
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

// Draw chart function
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
  dataStore.saveEqualizerData(frequencies);


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
