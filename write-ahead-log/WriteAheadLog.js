import fs from 'node:fs';
import path from 'path';


class WriteAheadLog {
    constructor(logPath,rotateSize){
        this.logPath = logPath;
        this.rotateSize = rotateSize;
    }

    writeBatch(entries) {// write single entry for the entire batch

        const index = this.getNewestDataIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: [...entries] };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;
        //const map = new Map(JSON.parse(JSON.stringify(logEntry.data)))
        //console.log(map instanceof Map); 
        fs.appendFileSync(this.logPath, logRow, 'utf8');
    }

    writeEntry(key, value) {
        const index = this.getNewestDataIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: { key, value } };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;

        fs.appendFileSync(tis.logPath, logRow, 'utf8');
    }

    getLogContent(filePath = this.logPath) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
            return '';
        }
        return fs.readFileSync(filePath, 'utf8');
    }

    // this approach can be harmful to performance
    getNewestDataIndex() {

        const logContent = this.getLogContent();

        const logRows = logContent.split('\n');
        let newestIndex = -1;

        for (const row of logRows) {
            if (row.trim() !== '') {
                const index = parseInt(row.split(';')[0]);
                if (index > newestIndex) {
                    newestIndex = index;
                }
            }
        }

        return newestIndex;
    }

    getSegmentedSize(){
        return this.rotateSize;
    }

    removeLogContent(filePath){
        
        let logContent = this.getLogContent(filePath);
        let logRows = logContent.split('\n');

        logRows.pop();                  // remove the '' charactor 
        const aimingRow = logRows.pop();    // remove the aim row
        
        const updatedContent = logRows.join('\n');
        fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
    
    searchLogFile(fileIndex){
        const dir = path.dirname(this.logPath);
        const files = fs.readdirSync(dir);
        const fileName = `wal_${fileIndex}.log`;

        for(const file of files){
            const filePath = path.join(dir,file);
            if(file.endsWith(fileName)){
                return filePath;
            }
        }
        return -1;
    }

    searchLogData(filePath, dataIndex){
        const logContent = this.getLogContent(filePath);
        const logRows = logContent.split('\n');
        for(const row of logRows){
            if(row.trim() !== ''){
                const index = parseInt(row.split(';')[0]);
                if(index === dataIndex){
                    return row; 
                }
            }
        }
        return -1;
    }


    /*    The following is Segmented Log implementation    */

    getLogRowCount(){
        const logContent = this.getLogContent();
        const logRows = logContent.split('\n');
        let rowCount = 0;

        for(const row of logRows){
            if(row.trim() !== ''){
                rowCount++;
            }
        }
        return rowCount;
    }

    getRotateData(){
        const logContent = this.getLogContent();
        const logRows = logContent.split('\n');
        var index = this.getSegmentedSize();
        let row = logRows[index];
        return row;
    }

    createNewLog(fileIndex){

        const fileName = `wal_${fileIndex}.log`;

        const dirPath = path.dirname(this.logPath);
        const filePath = path.join(dirPath, fileName);

        fs.writeFileSync(filePath,'');

        return filePath;
    }

    maybeRotate(){
        let newFilePath = this.logPath;
        if(this.getLogRowCount() > this.getSegmentedSize()){
            let row = this.getRotateData();
            
            if(row.trim()!==''){

                row += '\n'; 
 
                const newFileIndex = parseInt(row.split(';')[0]);
                 
                newFilePath = this.createNewLog(newFileIndex)
                
                fs.appendFileSync(newFilePath, row);
                
                this.removeLogContent(this.logPath);
            }
        }
        
        this.logPath = newFilePath;
    }
}

export default WriteAheadLog;




