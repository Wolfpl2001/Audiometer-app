const { app, ipcMain } = require("electron");
const path = require("path");
const datastore = require("./datastore.js");
const taskTranscodeAudio = require('./task.transcode.audio');
const {getEqualizerData} = require("./datastore");

// ipc handler process and save 
ipcMain.handle('file:processAndSave', async (event) => {
    try {
        const outputDir = app.getPath('temp'); // Katalog tymczasowy
        const outputFilePath = path.join(outputDir, "test.mp3"); // Ścieżka docelowego pliku

        //let returnFFmpeg = await processAudio({ datastore }, outputFilePath);
        const inputFilenameWithPath = datastore.getWaveformPath();
        const transcode = new taskTranscodeAudio.TaskTranscodeAudio();
        transcode.inputFile = inputFilenameWithPath;
        transcode.outputFile = outputFilePath;
        // TODO should be created from the file
        //getEqualizerData()

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
        const transcodeResult = await transcode.transcodeAudioFile();
        console.log('audiodownload.js -- ipcMain.handle file:proecessAndSave -- transcodeResult: ', transcodeResult);
        console.log('audiodownload.js -- ipcMain.handle file:proecessAndSave -- File processed and path saved:', outputFilePath);
        return { success: true, outputFilePath };
    } catch (error) {
        console.error('Error processing file:', error);
        return { success: false, error: error.message };
    }
});
