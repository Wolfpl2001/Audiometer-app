
$(document).ready(function() {
  $("#audiodiagram").prop('disabled', true);
  $("#richting").prop('disabled', true);
  // $("#downoload").prop('disabled', true);

  //
  // Handle audio file upload through dialog in Renderer process and save the waveform path
  //

  $("#audiobestand").click(async function() {
    console.log('Audio file button clicked');  
    const result = await window.electron.uploadAudioFile();
    console.log('Audio file upload result:', result);  
    if (!result.canceled) {
      const filePath = result.filePath;
      console.log('Selected file path:', filePath);
      
      //
      // call the saveWaveformPath function to save the waveform path
      //

      window.electron.saveWaveformPath({ waveformPath: filePath })
        .then(async (response) => {
          console.log('Waveform path saved:', response.waveformPath);
          
          //
          // generate waveform image
          //

          const waveformImagePath = await window.electron.generateWaveform(response.waveformPath);
          console.log('Waveform image generated at:', waveformImagePath); 
          
          //
          // display waveform image on the page
          //

          const waveformImage = document.getElementById('waveformImage');
          waveformImage.src = `file://${waveformImagePath}`;
          waveformImage.style.display = 'block'; 
        })
        .catch(error => {
          console.error('Failed to save waveform path:', error);
        });
    } else {
      console.log('File selection was canceled');
    }
  });
  
  
//
// Disable the audio file button and enable the audio diagram button where ther is waveform path
//
  $("#audiodiagram").click(function() {
    console.log('Audiodiagram gekozen');
    $("#richting").prop('disabled', false);
  });

  // $("#richting").click(function() {
  //   console.log('Richting gekozen');
  //   $("#downoload").prop('disabled', false);
  // });

  $("#downoload").click(function() {
    console.log('Download gestart');
    window.electron.processAudio();
  });
});

//
// Handle file dialog
//

document.getElementById('openFileBtn').addEventListener('click', () => {
  window.electron.send('open-file-dialog');
});

//
// Handle file data from Main process 
//

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

//
// XML parsing function
//

function parseXML(xmlString, callback) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    callback(null, xmlDoc);
  } catch (err) {
    callback(err, null);
  }
}

//
// Extract frequency data from XML
//

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

  //
  // Extract frequency and value data from each line and separate them into left and right ear arrays
  //

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

  //
  // Sort and remove duplicates from the extracted data arrays
  //
  const sortAndRemoveDuplicates = (data) => {
    return data.sort((a, b) => a[1] - b[1]).filter((item, index, self) =>
      index === self.findIndex((t) => t[1] === item[1])
    );
  };

  //
  // Display the sorted and duplicate-free left and right ear frequencies
  //
  const sortedLeftEar = sortAndRemoveDuplicates(leftEar);
  const sortedRightEar = sortAndRemoveDuplicates(rightEar);
  
  return { leftEar: sortedLeftEar, rightEar: sortedRightEar };
}

//
// Draw chart function to display the extracted frequency data
//
async function drawChart(frequencies) {
  try {
    console.log('Saving equalizer data:', frequencies);
      const response = await window.electron.saveEqualizerData(frequencies);
      console.log('Equalizer data saved successfully:', response);
  } catch (error) {
      console.error('Failed to save equalizer data:', error);
  }

  const canvas = document.getElementById('frequencyChart');
  if (!canvas) {
      console.error('Canvas element with id "frequencyChart" not found.');
      return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
      console.error('Failed to get canvas context');
      return;
  }

  //
  // Extract left and right ear labels and data from the frequencies object
  //

  const leftEarLabels = frequencies.leftEar.map(f => f[1]);
  const leftEarData = frequencies.leftEar.map(f => f[0]);
  const rightEarLabels = frequencies.rightEar.map(f => f[1]);
  const rightEarData = frequencies.rightEar.map(f => f[0]);
  

  //
  // Create a new chart object to display the extracted frequency data
  //

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
  async function downloadProcessedFile() {
    try {
        const { success, outputFilePath, error } = await ipcRenderer.invoke('file:processAndSave', );
        if (success) {
            console.log('File processed and saved:', outputFilePath);

            // Automatyczne pobieranie
            const fileData = fs.readFileSync(outputFilePath);
            const blob = new Blob([fileData], { type: 'audio/wav' });

            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'processed_audio.wav';
            downloadLink.click();
        } else {
            console.error('Error processing file:', error);
        }
    } catch (err) {
        console.error('Error downloading file:', err);
    }
}

//
// Handle the process button click event
//
document.getElementById('processButton').addEventListener('click', downloadProcessedFile);
}
