<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Afficher les Club</title>
</head>
<body>

    <table border='1px'>
        <tr>
            <th> Id</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Adress</th>
            <th>Domaine</th>
        </tr>
        <tr>
            <td><?php echo ($_GET['id']) ?> </td>
            <td><?php echo ($_GET['nom'])?></td>
            <td><?php echo ($_GET['desc']) ?></td>
            <td><?php echo ($_GET['adr']) ?></td>
            <td><?php echo ($_GET['dom']) ?></td>
        </tr>
</body>