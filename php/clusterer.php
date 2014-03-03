<?php
define('OFFSET', 268435456);
define('RADIUS', 85445659.4471); /* $offset / pi() */
    
function lonToX($lon) {
    return round(OFFSET + RADIUS * $lon * pi() / 180);        
}

function latToY($lat) {
    return round(OFFSET - RADIUS * 
                log((1 + sin($lat * pi() / 180)) / 
                (1 - sin($lat * pi() / 180))) / 2);
}

function pixelDistance($lat1, $lon1, $lat2, $lon2, $zoom) {
    $x1 = lonToX($lon1);
    $y1 = latToY($lat1);

    $x2 = lonToX($lon2);
    $y2 = latToY($lat2);
        
    return sqrt(pow(($x1-$x2),2) + pow(($y1-$y2),2)) >> (21 - $zoom);
}

function haversineDistance($lat1, $lon1, $lat2, $lon2) {
    $latd = deg2rad($lat2 - $lat1);
    $lond = deg2rad($lon2 - $lon1);
    $a = sin($latd / 2) * sin($latd / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($lond / 2) * sin($lond / 2);
         $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return 6371.0 * $c;
}

function cluster($markers, $distance, $zoom) {
    $clustered = array();
    /* Loop until all markers have been compared. */
    while (count($markers)) {
        $marker  = array_pop($markers);
        $cluster = array();
        /* Compare against all markers which are left. */
        foreach ($markers as $key => $target) {
            $pixels = pixelDistance($marker['lat'], $marker['lng'],
                                    $target['lat'], $target['lng'],
                                    $zoom);
            /* If two markers are closer than given distance remove */
            /* target marker from array and add it to cluster.      */
            if ($distance > $pixels) {
                unset($markers[$key]);
                $cluster[] = $target;
            }
        }

        /* If a marker has been added to cluster, add also the one  */
        /* we were comparing to and remove the original from array. */
        if (count($cluster) > 0) {
            $cluster[] = $marker;
            $clustered[] = $cluster;
        } else {
            $clustered[] = $marker;
        }
    }
    return $clustered;
}
?>