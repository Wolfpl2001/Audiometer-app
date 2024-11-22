const { app, ipcMain } = require("electron");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const fs = require("fs");
const { getWaveformPath } = "./storeData.js"; // Importowanie funkcji do zapisu ścieżki


ipcMain.handle('file:processAndSave', async (event) => {
    try {
        const outputDir = app.getPath('temp'); // Katalog tymczasowy
        const outputFilePath = path.join(outputDir, "test.mp3"); // Ścieżka docelowego pliku

        // Przetwarzanie audio
        await processAudio({ getWaveformPath }, outputFilePath);

        // Zapis ścieżki do storeData.js
        saveWaveformPath({ waveformPath: outputFilePath });

        console.log('File processed and path saved:', outputFilePath);
        return { success: true, outputFilePath };
    } catch (error) {
        console.error('Error processing file:', error);
        return { success: false, error: error.message };
    }
});

// Funkcja obsługująca przetwarzanie audio z FFmpeg
function processAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg({ getWaveformPath })
            .setFfmpegPath(ffmpegStatic)
            .audioFilters([
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
            ])
            .on('end', () => {
                console.log('Audio processing completed:', outputPath);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('Error during audio processing:', err);
                reject(err);
            })
            .save(outputPath);
    });
}
