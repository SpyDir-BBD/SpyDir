const getRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
};

export const Themes = {
    Light: {
        MainBackground: '#f6f6f6',
        Accent: '#5145ba',
        CardColor: '#ffffff',
        CardBorder: 'none',
        TextColor: '#000000',
        DropAreaColor: '#5145ba0d',
        DropAreaBorder: '#5145ba4d',
        LinkColor: '#5145ba',
        LinkAccent: 'none',
        folderChildFiles: '#5c5c94'
        },
    Night: {
        MainBackground: '#161616',
        Accent: '#5145ba',
        CardColor: '#101010',
        CardBorder: 'none',
        TextColor: '#ffffff8f',
        DropAreaColor: '#161616',
        DropAreaBorder: '#5145ba4d',
        LinkColor: '#5145ba',
        LinkAccent: 'none',
        folderChildFiles:'#e0e2ea'
        },
    Contrast: {
        MainBackground: '#161616',
        Accent: '#ffff00',
        CardColor: '#101010',
        CardBorder: '#ffff00',
        TextColor: '#ffff00',
        DropAreaColor: '#161616',
        DropAreaBorder: '#ffff00',
        LinkColor: '#101010',
        LinkAccent: '#ffff00',
        folderChildFiles:'#d5E69A'
        },
    Random: () => ({
        MainBackground: getRandomColor(),
        Accent: getRandomColor(),
        CardColor: getRandomColor(),
        CardBorder: getRandomColor(),
        TextColor: getRandomColor(),
        DropAreaColor: getRandomColor(),
        DropAreaBorder: getRandomColor(),
        LinkColor: getRandomColor(),
        LinkAccent: getRandomColor(),
    }),
};