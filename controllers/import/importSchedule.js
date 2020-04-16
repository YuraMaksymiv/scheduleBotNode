const excelToJson = require('convert-excel-to-json');

module.exports = async (req, res) => {
    req.log.info("Start importSchedule controller");
    try {
        const dayNames = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
        const times = ["9.30-10.05", "10.20-11.55", "12.10-13.45", "14.30-16.05", "16.20-17.35"];

        let result;
        let table = {};
        let workbook = excelToJson({
            sourceFile: 'files/rozklad_idtd.xls'//file should be get from request
        });
        workbook = workbook["КН, ІСТ"];
        // here should be forin for all groups
        let firstRow = workbook[0];

        //form table to save in DB
        for (const key in firstRow) {
            table[key] = {groupName: firstRow[key]};
            table[key].days = [];
            for (let i = 0; i < 5; i++) {
                let lessonData = [];
                for (let j = 0; j < 5; j++) {
                    let number = j+1;
                    lessonData.push({
                        numberOfLesson: '' + number,
                        time: times[i],
                        nameOfLesson: ["-/-", "-/-"]
                    })
                };
                table[key].days.push({
                    day: dayNames[i],
                    lesson: lessonData
                });
            }
        }

        delete table["A"];//should delete first and last
        delete table["AP"];

        // let newTable = [];
        // for (const key in table) {
        //     newTable.push(table[key]);
        // }
        // table = newTable

        for (let i = 1; i < workbook.length; i++) {
            let count = 1, day = 0, lesson = 0;
            let currentRow = workbook[i];

            console.log(currentRow);

            for (const rowKey in currentRow) {

            }

            break

            if(i % 2 === 0) lesson++; //check number of lesson
            if(count === 10) { //check day
                count = 1;
                // i++;
                day++;
                lesson = 0;
            }
        }
        
        
        
        

        // for (const key in table) {
        //     await req.mongoConnection.updateSchedule(table[key])
        // }

        return res.json({
            code: 200,
            data: table
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
