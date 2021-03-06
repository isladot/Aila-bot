const path = require('path');
const fs = require('fs');

module.exports = (client) => {
    const baseFile = 'command-base.js';
    const loadFile = 'load-commands.js';
    const commandBase = require(`./${baseFile}`);

    const commands = [];

    const readCommands = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir));

        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file));

            if (stat.isDirectory()) {
                readCommands(path.join(dir, file));
            } else if (file !== baseFile && file !== loadFile) {
                const option = require(path.join(__dirname, dir, file));
                const pathDivider = process.platform === "linux" ? '/' : '\\';
                const commandPath = path.join('commands', dir, file).split('.')[0].replace('-', '').split(pathDivider);

                commands.push(option);

                if (client) {
                    commandBase(client, option, commandPath);
                }
            }
        }
    }

    readCommands('.');

    return commands;
}