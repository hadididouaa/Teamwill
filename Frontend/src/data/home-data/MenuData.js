const menu_data = [
    {   
        id: 1,
        title: "Dashboard",
        link: "/dashboard",
        roles: ["Admin"],  
    },
   
    {
        id: 3,
        title: "Users",
        link: "/listUsers",
        roles: ["Admin", "RH"],  
    },
    {
        id: 4,
        title: "Formations",
        link: "#",    
        roles: ["Formateur"],  
        sub_menus: [
            { link: "/formations", title: "Formations" },
            { link: "/Myformations", title: "Mes Formations" },  
        ],
    },
];

export default menu_data;
