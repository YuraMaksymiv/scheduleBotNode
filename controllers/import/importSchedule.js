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

        for (const workBookKey in workbook) {
            let newWorkbook = workbook[workBookKey];
            let firstRow = newWorkbook[0];

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

            let count = 1, day = 0, lesson = 0;
            for (let i = 1; i < newWorkbook.length; i+=2) {
                let currentRow = newWorkbook[i];
                let nextRow = newWorkbook[i+1];

                for (const rowKey in currentRow) {
                    if(table[rowKey] && table[rowKey].days) {
                        table[rowKey].days[day].lesson[lesson].nameOfLesson[0] = currentRow[rowKey];
                        if(!nextRow[rowKey]) table[rowKey].days[day].lesson[lesson].nameOfLesson[1] = currentRow[rowKey];
                        else if(nextRow[rowKey]) table[rowKey].days[day].lesson[lesson].nameOfLesson[1] = nextRow[rowKey];
                    }

                }

                if(count === 5) { //check day
                    count = 1;
                    day++;
                    lesson = 0;
                } else {
                    count++;
                    lesson++
                }
            }

            let newTable = [];
            for (const key in table) {
                newTable.push(table[key]);
            }
            newTable.shift();
            newTable.pop();
            table = newTable;

            for (let i = 0; i < table.length; i++) {
                let currentGroup = table[i];
                let name = currentGroup.groupName.split("/");
                if(name[1] && name[1] == "1" || name[1] == "1м") {
                    let otherGroups = table.filter(g => {
                       if(g.groupName !== currentGroup.groupName) {
                           let n = g.groupName.split('/');
                           if(n[0] == name[0]) return g
                       }
                    })
                    if(otherGroups.length) {
                        for (let j = 0; j < otherGroups.length; j++) {
                            let currOtherGroup = otherGroups[j];
                            for (let k = 0; k < 5; k++) {
                                for (let l = 0; l < 5; l++) {
                                    if(currOtherGroup.days[k].lesson[l].nameOfLesson[0] === "-/-") {
                                        currOtherGroup.days[k].lesson[l].nameOfLesson[0] = currentGroup.days[k].lesson[l].nameOfLesson[0]
                                    }
                                    if(currOtherGroup.days[k].lesson[l].nameOfLesson[1] === "-/-") {
                                        currOtherGroup.days[k].lesson[l].nameOfLesson[1] = currentGroup.days[k].lesson[l].nameOfLesson[1]
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (const key in table) {
                await req.mongoConnection.updateSchedule(table[key])
            }
        }


        return res.json({
            code: 200,
            data: true
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: e.code,
            data: e.message
        });
    }
};
