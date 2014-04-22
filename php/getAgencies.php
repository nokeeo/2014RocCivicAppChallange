<?php
    include_once("apiHandler.php");
    

    $jsonData = json_encode(array_values(getAgencyCodes()));
    header("Content-type: text/json");
    
    echo $jsonData;
?>