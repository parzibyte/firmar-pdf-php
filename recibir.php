<?php
if (
    !isset($_POST["id"]) ||
    !isset($_POST["nombre"]) ||
    !isset($_POST["apellido"]) ||
    !isset($_POST["direccion"]) ||
    !isset($_FILES["pdf"])
) {
    exit("Faltan datos");
}
$archivoPdf = $_FILES["pdf"];
$id = $_POST["id"];
# Aquí podemos acceder a $_POST["nombre"], apellido, direccion
$directorio = "firmas";
if (!file_exists($directorio)) {
    mkdir($directorio);
}
$nombre = $id . ".pdf";
$ubicacion = $directorio . DIRECTORY_SEPARATOR . $nombre;
move_uploaded_file($archivoPdf["tmp_name"], $ubicacion);
echo "OK";
