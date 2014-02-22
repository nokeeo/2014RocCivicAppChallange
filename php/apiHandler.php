<?php
function getData($startDate, $endDate) {
    $currentDate = $startDate;
    $data = array();
    while($currentDate <= $endDate) {
        $apiDateFormat = date("Y-n-j", strtotime($currentDate));
        $formatURL = "http://mcsafetyfeed.org/api/getgeo.php?date=" . urlencode($apiDateFormat);
        $rawJson = json_decode(file_get_contents($formatURL));
        foreach($rawJson as $element) {
            array_push($data, $element);   
        }
        $currentDate = date("Y-m-d", strtotime($currentDate . "+ 1 day"));
    }
    return $data;
}
?>