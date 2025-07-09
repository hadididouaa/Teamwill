const menu_data = [
    {   
        id: 1,
        title: "Dashboard",
        link: "/instructor-dashboard",
        roles: ["Formateur"],  
    },
    {
        id: 2,
        title: "Formations",
        link: "/formations",    
        roles: ["Admin", "Apprenant"],  
    },
    {
        id: 3,
        title: "Utilisateurs",
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
