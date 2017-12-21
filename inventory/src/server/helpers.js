const fs = require('fs');

module.exports = {
  parseHost(query) {
    let newHost = {};
    let host = query.split('?')[1];
    host = decodeURI(host).replace(/\|/g, ' ');
    host = host.split(/[=&]/);
    for (let prop = 0, value = 1; prop < host.length; prop += 2, value += 2) {
      newHost[host[prop]] = host[value];
    }
    return newHost;
  },
  hash(str) {
    str = str.toLowerCase();
    let hash = 0;
    let i, chr;
    if (str.length === 0) { return hash; }
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  },
  handleError(error, path) {
    if (!(error instanceof Error)) {
      const message = `Non-error sent to error handler at: ${new Date().toString()}\nFrom: ${path}\nNon-error: ${error}\n${'-'.repeat(45)}\n`;
      fs.appendFile('src/data/ErrorLog.txt', message, e => {
        if (e) { throw error; }
      });
      return 'Non-error sent to #handleError()';
    }
    const message = `Error sent to error handler at: ${new Date().toString()}\nFrom: ${path}\nError: ${error}\n${'-'.repeat(45)}\n`;
    fs.appendFile('src/data/ErrorLog.txt', message, e => {
      if (e) { throw error; }
    });
    return 'Error has been logged.';
  }
};
