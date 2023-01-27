<?php
if (isset($_REQUEST["ref"])) {
    $_SESSION["ref"] = $_REQUEST["ref"];
    header("location: register");
} else {
    header("location: news");
}
?>