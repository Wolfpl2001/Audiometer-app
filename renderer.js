$(document).ready(function() {
  $("#audiodiagram").prop('disabled', true);
  $("#richting").prop('disabled', true);
  $("#downoload").prop('disabled', true);

  // Hier bedoelt wanneer een audiobestand wordt gekozen
  $("#audiobestand").click(async function() {
    const result = await window.electron.uploadAudioFile();
    if (!result.canceled) {
      console.log('Bestand geüpload:', result.filePaths);
      $("#audiodiagram").prop('disabled', false);
    }
  });

  // Hier wordt de audio diagram geklikt
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
