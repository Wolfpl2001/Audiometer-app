const { app, ipcMain, BrowserWindow, Notification, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const datastore = require("./datastore.js");
const taskTranscodeAudio = require('./task.transcode.audio');

ipcMain.handle('file:processAndSave', async (event) => {
    try {
        // Allow the user to select a target folder
        const folderResult = await dialog.showOpenDialog({
            title: "Select Folder to Save Processed Audio",
            properties: ['openDirectory']
        });

        if (folderResult.canceled) {
            return { success: false, message: "No folder selected" };
        }

        const selectedFolder = folderResult.filePaths[0];

        // Notification about the start of audio processing
        new Notification({
            title: 'Sound change in progress',
            body: 'Your audio is being processed and saved',
        }).show();

        // Retrieve the input file path
        const inputFilenameWithPath = datastore.getWaveformPath();
        if (!inputFilenameWithPath || !fs.existsSync(inputFilenameWithPath)) {
            throw new Error('Invalid waveform path or file does not exist.');
        }

        // Prepare for transcoding
        const transcode = new taskTranscodeAudio.TaskTranscodeAudio();
        const filenameWithoutExtension = path.basename(inputFilenameWithPath, path.extname(inputFilenameWithPath));
        const outputFilePath = path.join(selectedFolder, filenameWithoutExtension + '_processed.wav');

        transcode.inputFile = inputFilenameWithPath;
        transcode.outputFile = outputFilePath;

        // Set the audio filter
        transcode.audioFilter = [
            'volume=-12dB',
            'channelsplit=channel_layout=stereo[left][right]',
            '[left]equalizer=f=125:width_type=h:width=200:g=0.0[a]',
            '[right]equalizer=f=125:width_type=h:width=200:g=5.0[b]',
            '[a]equalizer=f=250:width_type=h:width=200:g=5.0[a]',
            '[b]equalizer=f=250:width_type=h:width=200:g=0.0[b]',
            '[a]equalizer=f=500:width_type=h:width=200:g=0.0[a]',
            '[b]equalizer=f=500:width_type=h:width=200:g=-5.0[b]',
            '[a]equalizer=f=750:width_type=h:width=200:g=0.0[a]',
            '[b]equalizer=f=750:width_type=h:width=200:g=5.0[b]',
            '[a]equalizer=f=1000:width_type=h:width=200:g=15.0[a]',
            '[b]equalizer=f=1000:width_type=h:width=200:g=15.0[b]',
            '[a]equalizer=f=1500:width_type=h:width=200:g=10.0[a]',
            '[b]equalizer=f=1500:width_type=h:width=200:g=15.0[b]',
            '[a]equalizer=f=2000:width_type=h:width=200:g=10.0[a]',
            '[b]equalizer=f=2000:width_type=h:width=200:g=15.0[b]',
            '[a]equalizer=f=3000:width_type=h:width=200:g=10.0[a]',
            '[b]equalizer=f=3000:width_type=h:width=200:g=10.0[b]',
            '[a]equalizer=f=4000:width_type=h:width=200:g=10.0[a]',
            '[b]equalizer=f=4000:width_type=h:width=200:g=10.0[b]',
            '[a]equalizer=f=6000:width_type=h:width=200:g=15.0[a]',
            '[b]equalizer=f=6000:width_type=h:width=200:g=15.0[b]',
            '[a]equalizer=f=8000:width_type=h:width=200:g=20.0[a]',
            '[b]equalizer=f=8000:width_type=h:width=200:g=15.0[b]',
            '[a][b]join=inputs=2:channel_layout=stereo',
            'dynaudnorm',
            'volume=-6dB'
        ];

        // Transcode the audio file
        const transcodeResult = await transcode.transcodeAudioFile();
        console.log('[INFO] Transcoding completed:', transcodeResult);

        // Notification about the completion of audio processing
        dialog.showMessageBox({
          type: 'info',
          title: 'Processing Complete',
          message: 'Your audio file has been successfully processed.',
          buttons: ['Open Folder', 'OK']
      }).then(result => {
          if (result.response === 0) { // Indeks 0 odpowiada przyciskowi "Open Folder"
              shell.openPath(selectedFolder).then(response => {
                  if (response) {
                      console.error('Error opening folder:', response);
                  }
              });
          }
      });

        return { success: true, selectedFolder };
    } catch (error) {
        console.error('[ERROR] Processing file:', error.message);
        return { success: false, error: error.message };
    }
});
