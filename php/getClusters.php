<?php
	include_once('apiHandler.php');
	include_once('clusterer.php');

	$startDate = date("Y-m-d", strtotime($_GET['start']));
	$endDate = date("Y-m-d", strtotime($_GET['end']));
	
	$data = getData($startDate, $endDate);
	$clusters = cluster($data, 3, 13);
	
	header('Content-type: text/json');
	echo(json_encode($clusters));
?>