<?php

require("database.php");

$KODI_group = 34;

$cmd = $_REQUEST["command"];

PaiDatabase::connectDB();

function error($msg)
{
    PaiDatabase::disconnectDB();
    header('Content-Type: application/json');
    echo json_encode(array('status' => "error", 'data' => $msg));
}

function success($msg)
{
    PaiDatabase::disconnectDB();
    header('Content-Type: application/json');
    echo json_encode(array('status' => "success", 'data' => $msg));
}

function verify_password($password, $password_hash)
{
    $salt = substr($password_hash, 7, 22);
    $options = [
        'salt' => $salt
    ];
    if (password_hash($password, PASSWORD_BCRYPT, $options) == $password_hash)
        return true;
    else
        return false;
}

function check_account($username, $password, $kodi_group)
{
    $res = PaiDatabase::getSQLRecords("SELECT * FROM `core_members` WHERE `name` LIKE '$username' AND `mgroup_others` = '$kodi_group'");
    if (count($res) == 0) {
        return false;
    } else {
        $member_pass_hash = $res[0]['members_pass_hash'];
        if (!$member_pass_hash)
            $member_pass_hash = $res[0]['conv_password'];
        if (verify_password($password, $member_pass_hash)) {
            return true;
        } else {
            return false;
        }
    }

}

if ($cmd == 'verify') {
    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];

    if (check_account($username, $password, $KODI_group)) {
        success('Verify Success!');
    } else {
        error('Invalid Account!');
    }
}
else if ($cmd == 'categories') {
    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];

    if (check_account($username, $password, $KODI_group)) {
        $category_res = PaiDatabase::getSQLRecords("SELECT `vcat_id`, `vcat_title` FROM `videobox_categories`");
        success($category_res);
    } else {
        error('Invalid Account!');
    }
}

else if ($cmd == 'videos') {
    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];
    $category_id = $_REQUEST["id"];

    if (check_account($username, $password, $KODI_group)) {
        $video_res = PaiDatabase::getSQLRecords("SELECT v_id, v_title, v_thumbnail_medium FROM videobox_videos WHERE v_cat='$category_id'");
        success($video_res);
    } else {
        error('Invalid Account!');
    }
}

else if ($cmd == 'servers') {
    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];
    $video_id = $_REQUEST["id"];

    if (check_account($username, $password, $KODI_group)) {
        $server_res = PaiDatabase::getSQLRecords("SELECT `vbo_server`, `vbs_name` FROM `videobox_online` INNER JOIN `videobox_servers` ON `videobox_online`.`vbo_server`=`videobox_servers`.`vbs_id` WHERE `vbo_video`='$video_id' GROUP BY `vbo_server`");
        success($server_res);
    } else {
        error('Invalid Account!');
    }
}

else if ($cmd == 'movies') {
    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];
    $video_id = $_REQUEST["id"];
    $server_id = $_REQUEST["server"];

    if (check_account($username, $password, $KODI_group)) {
        $movie_res = PaiDatabase::getSQLRecords("SELECT `vbo_url` FROM `videobox_online` WHERE `vbo_video`='$video_id' AND `vbo_server`='$server_id'");
        success($movie_res);
    } else {
        error('Invalid Account!');
    }
}
else {
    var_dump($_POST);
    error('Invalid Request!');
}