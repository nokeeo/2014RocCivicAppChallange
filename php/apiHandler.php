<?php
function getData($startDate, $endDate) {
    $currentDate = $startDate;
    $data = array();
    while($currentDate <= $endDate) {
        $apiDateFormat = date("Y-n-j", strtotime($currentDate));
        $formatURL = "http://mcsafetyfeed.org/api/getgeo.php?date=" . urlencode($apiDateFormat);
        $rawJson = json_decode(file_get_contents($formatURL));
        foreach($rawJson as $element) {
            $element = (array)$element;
            $element["agencyType"] = getAgencyForId($element["itemid"]);
            $element["region"] = getRegionForId($element["itemid"]);
            array_push($data, $element);   
        }
        $currentDate = date("Y-m-d", strtotime($currentDate . "+ 1 day"));
    }
    return $data;
}

function getAgencyForId($id) {
    $agencyCodes = getAgencyCodes();
    $agencyChar = $id[3];
    return $agencyCodes[$agencyChar];
}

function getRegionForId($id) {
    $regionCodes = getRegionCodes();
    $regionString = substr($id, 0, 3);
    $region = $regionCodes[$regionString];
    if(is_null($region)) {
        $region = $regionCodes[substr($id, 0, 2)];
    }
    return $region;
}

function getRegionCodes() {
    $codes = array(
        "AIR" => "Rochester Airport",
        "BAR" => "Barnard",
        "BBA" => "Bushnell's Basin",
        "BER" => "Bergen",
        "BRI" => "Brighton",
        "BRO" => "Brockport",
        "CHI" => "Chili",
        "CHU" => "Churchville",
        "CLI" => "Clifton",
        "CTY" => "Rochester City",
        "EGY" => "Egypt",
        "ERO" => "East Rochester",
        "FAI" => "Fairport",
        "GAT" => "Gates",
        "GRE" => "Greece",
        "HAM" => "Hamlin",
        "HEN" => "Henrietta",
        "HFL" => "Honeoye Falls",
        "HIL" => "Hilton",
        "HSO" => "Animal Control",
        "IRO" => "Irondequoit",
        "LAK" => "Lakeshore",
        "LAU" => "Laurelton",
        "MC" => "Monroe County",
        "MEN" => "Mendon",
        "MON" => "Monroe",
        "MOR" => "Morton",
        "MUM" => "Mumford",
        "NGR" => "North Greece",
        "NYS" => "New York State",
        "OGD" => "Ogden",
        "OTH" => "",
        "PEN" => "Penfield",
        "PER" => "Perinton",
        "PIT" => "Pittsford",
        "PPL" => "Point Pleasant",
        "RCU" => "Ridge Culver",
        "RIT" => "Rochester Institute of Technology",
        "RME" => "Rural/Metro of Rochester",
        "RRO" => "Ridge Road",
        "RT" => "Regional Trafic",
        "RUS" => "Rush",
        "SBR" => "Sea Breeze",
        "SCO" => "Scottsville",
        "SPA" => "Saint Paul",
        "SPE" => "Spencerport",
        "UHI" => "Union Hill Association",
        "WEB" => "Webster",
        "WLK" => "Walker",
        "WWB" => "West Webster",
    );
    
    return $codes;
}

function getAgencyCodes() {
    $codes = array(
        "F" => "Fire",
        "E" => "Ambulance",
        "P" => "Police",
        "C" => "Trafic"
    );
    return $codes;
}
?>