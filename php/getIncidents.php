<?php
include_once("apiHandler.php");

$startDate = date("Y-m-d", strtotime($_GET['start']));
$endDate = date("Y-m-d", strtotime($_GET['end']));

$jsonData = json_encode(getData($startDate, $endDate));

header("Content-type: text/json");
echo($jsonData);
?>