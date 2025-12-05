document.getElementById("audio").addEventListener("change", (event) => {
    const file = event.target.files[0]

    const reader = new FileReader()

    reader.addEventListener("load", (event) => {
        const arrayBuffer = event.target.result

        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)()

        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            const frequencyBufferLength = analyser.frequencyBinCount
            const frequencyData = new Uint8Array(frequencyBufferLength)
            
            // Pour extraire les données en continu :
            const source = audioContext.createBufferSource()
            source.buffer = audioBuffer
            source.connect(analyser)
            analyser.connect(audioContext.destination)
            source.start()
            
            function extractData() {
                analyser.getByteFrequencyData(frequencyData)
                console.log(frequencyData) // Vos données de fréquence
                requestAnimationFrame(extractData)
            }
            extractData()
            
            visualize(audioBuffer, audioContext)
        })
    })

    reader.readAsArrayBuffer(file)
})
