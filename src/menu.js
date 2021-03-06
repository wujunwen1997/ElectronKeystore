const { app, Menu } = require('electron');

const setDefaultApplicationMenu = () => {
    if (process.platform === 'darwin') {
      const template = [
        {
          label: '编辑',
          submenu: [
            {
              role: 'undo'
            },
            {
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              role: 'cut'
            },
            {
              role: 'copy'
            },
            {
              role: 'paste'
            },
            {
              role: 'pasteandmatchstyle'
            },
            {
              role: 'delete'
            },
            {
              role: 'selectall'
            }
          ]
        }
      ];
      template.unshift({
            label: app.getName(),
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        });
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    }
};

module.exports = setDefaultApplicationMenu;
