import {spawn} from 'child_process';


// Function to start the server
function startServer(){
    console.log("server start!");
    const serverProcess = spawn('node', ['server_noWAL.js'], { stdio: 'inherit' });

    // Randomly terminate the server after 5 to 15 seconds
    const randomTime = Math.floor(Math.random() * 10000) + 5000;
    setTimeout(() => {
        console.log(`Terminating server after ${randomTime / 1000} seconds`);
        serverProcess.kill();
    }, randomTime);

    // Restart the server once it is terminated
    serverProcess.on('exit', (code, signal) => {
        if (signal === 'SIGTERM') {
            console.log('Server terminated. Restarting...\n');
            startServer();
        }
    });
}

// Start the server for the first time
startServer();

