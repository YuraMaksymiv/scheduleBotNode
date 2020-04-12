app.get('/test', async (req, res) => {
    console.log("start /test");
    let shedule = [];

    let groups = exelParser({
        sourceFile: 'rozklad_idtd.xls',
        range: 'A1:Z1',
        sheets: ['КН, ІСТ']
    });

    for (let group1 in groups['КН, ІСТ'][0]) {

        let a = groups['КН, ІСТ'][0][group1];
        let subject = exelParser({
            sourceFile: 'rozklad_idtd.xls',
            range: `${group1}2:${group1}11`,
            sheets: ['КН, ІСТ']
        });

        let subjectNames = [];
        for (let i = 0; i < subject['КН, ІСТ'].length; i++) {
            subjectNames.push(Object.values(subject['КН, ІСТ'][i])[0]);
        }

        let sheduleItem = {[a]: {day: "Понеділок", subjects: subjectNames}};
        shedule.push(sheduleItem);
    }

    console.log("end /test");
    return res.json(shedule);
});