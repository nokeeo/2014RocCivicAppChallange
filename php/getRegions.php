<?php
include_once("apiHandler.php");

header("Content-type: text/json");

$jsonData = json_encode(array_values(getRegionCodes()));

echo $jsonData;

?>