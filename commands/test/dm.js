function DiffDays(creationDate, todayDate) {
    var timeDiff = todayDate - creationDate;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

module.exports = {
    commands: ['dm', 'test'],
    maxArgs: 0,
    callback: (message, arguments, text, client) => {
        message.delete();
        //TEST SECTION//
        const member = message.author;
        var todayDate = new Date();
        todayDate = (todayDate.getMonth() + 1) + '/' + todayDate.getDate() + '/' + todayDate.getFullYear();
        const memberCreationDate = new Intl.DateTimeFormat('en-US').format(member.createdAt);
        const memberAge = DiffDays(Date.parse(memberCreationDate), Date.parse(todayDate));
        // ---------- //
        const authorID = message.author.id;
        client.users.fetch(authorID).then((user) => {
            user.send(`Questo è un messaggio autogenerato dal sistema.\n${memberAge}\n${memberCreationDate}\n${todayDate}`);
        });
    }
}