const excelToJson = require('convert-excel-to-json');

module.exports = {

        importGroupsList: async function (sectionName, file) {
            let shedule = [];

            let groups = excelToJson({
                source: file.buffer,
                range: 'A1:Z1'
            });
            let all = [];

            for (let group in groups) {
                let groupsNames = [];
                for (let groupsKey in groups[group][0]) {
                    groupsNames.push(groups[group][0][groupsKey])
                }
                groupsNames.pop();
                groupsNames.splice(0, 2);
                let a = {section: group, groups: groupsNames};
                all.push(a);
            }

            let groupsToDB = [];
            for (let i = 0; i < all.length; i++) {
                let ind = all[i];
                let groupNames = [];
                ind.groups.forEach(function (j) {
                    let a = j.split('-');
                    if(a[0].slice(-1) === " ") a = a[0].split(' ');
                    groupNames.push(a[0]);
                });

                groupNames = groupNames.filter((item, k, ar) => ar.indexOf(item) === k);

                groupNames.forEach(function (k) {
                    let mainGroups = [];
                    let groupList = ind.groups.filter(g => g.includes(k));
                    groupList.forEach(l => {
                        let b = l.split('/');
                        mainGroups.push(b[0]);
                    })

                    mainGroups = mainGroups.filter((item, k, ar) => ar.indexOf(item) === k);

                    let finalList = [];
                    mainGroups.forEach(p => {
                        let subGroups = groupList.filter(g => g.includes(p));
                        finalList.push({
                            mainGroup: p,
                            subGroups: subGroups
                        })
                    })
                    groupsToDB.push({
                        groupName: k,
                        groupList: finalList
                    })
                });
            }
            let toDB = {
                section: sectionName,
                groups: groupsToDB
            };
            return toDB
        },

        importSchedule: async function (file) {
            const dayNames = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
            const times = ["9.30-10.05", "10.20-11.55", "12.10-13.45", "14.30-16.05", "16.20-17.35"];

            let result;
            let table = {};
            let workbook = excelToJson({
                source: file.buffer
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
                            let number = j + 1;
                            lessonData.push({
                                numberOfLesson: '' + number,
                                time: times[j],
                                nameOfLesson: [{lessonName: "-/-", isCloned: false}, {lessonName: "-/-", isCloned: false}]
                            })
                        }
                        ;
                        table[key].days.push({
                            day: dayNames[i],
                            lesson: lessonData
                        });
                    }
                }

                let count = 1, day = 0, lesson = 0;
                for (let i = 1; i < newWorkbook.length; i += 2) {
                    let currentRow = newWorkbook[i];
                    let nextRow = newWorkbook[i + 1];

                    if (nextRow) {
                        for (const rowKey in currentRow) {
                            if (table[rowKey] && table[rowKey].days) {
                                table[rowKey].days[day].lesson[lesson].nameOfLesson[0] = {lessonName: currentRow[rowKey], isCloned: false};
                                if (!nextRow[rowKey]) table[rowKey].days[day].lesson[lesson].nameOfLesson[1] = {lessonName: currentRow[rowKey], isCloned: true};
                                else if (nextRow[rowKey]) table[rowKey].days[day].lesson[lesson].nameOfLesson[1] = {lessonName: nextRow[rowKey], isCloned: false};
                            }
                        }
                    }

                    if (count === 5) { //check day
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
                    if (name[1] && name[1] == "1" || name[1] == "1м") {
                        let otherGroups = table.filter(g => {
                            if (g.groupName !== currentGroup.groupName) {
                                let n = g.groupName.split('/');
                                if (n[0] == name[0]) return g
                            }
                        })
                        if (otherGroups.length) {
                            for (let j = 0; j < otherGroups.length; j++) {
                                let currOtherGroup = otherGroups[j];
                                for (let k = 0; k < 5; k++) {
                                    for (let l = 0; l < 5; l++) {
                                        if (currOtherGroup.days[k].lesson[l].nameOfLesson[0].lessonName === "-/-") {
                                            currOtherGroup.days[k].lesson[l].nameOfLesson[0] = {
                                                lessonName: currentGroup.days[k].lesson[l].nameOfLesson[0].lessonName,
                                                isCloned: true
                                            }
                                        }
                                        if (currOtherGroup.days[k].lesson[l].nameOfLesson[1].lessonName === "-/-") {
                                            currOtherGroup.days[k].lesson[l].nameOfLesson[1] = {
                                                lessonName: currentGroup.days[k].lesson[l].nameOfLesson[1].lessonName,
                                                isCloned: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return table;
        }


};