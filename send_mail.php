<?php

$to = "zarexlaser@gmail.com";
$subject = "Nova ponudba z spletne strani ŽareX";

$name = $_POST["name"] ?? "";
$service = $_POST["service"] ?? "";
$car = $_POST["car"] ?? "";
$message = $_POST["message"] ?? "";

$body = "
Ime stranke: $name
Storitev: $service
Avto: $car

Opis:
$message
";

$headers = "From: noreply@zarex.si";

// ---- PRIPONKE ---- //

$boundary = md5(time());
$headers .= "\r\nMIME-Version: 1.0\r\n"
          . "Content-Type: multipart/mixed; boundary=\"$boundary\"";

$fullBody = "--$boundary\r\n";
$fullBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
$fullBody .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$fullBody .= $body . "\r\n";

// Attachments loop
if (!empty($_FILES['attachments']['name'][0])) {

    for ($i = 0; $i < count($_FILES['attachments']['name']); $i++) {

        $file_tmp = $_FILES['attachments']['tmp_name'][$i];
        $file_name = $_FILES['attachments']['name'][$i];
        $file_type = $_FILES['attachments']['type'][$i];

        if (is_uploaded_file($file_tmp)) {
            $file_data = chunk_split(base64_encode(file_get_contents($file_tmp)));

            $fullBody .= "--$boundary\r\n";
            $fullBody .= "Content-Type: $file_type; name=\"$file_name\"\r\n";
            $fullBody .= "Content-Disposition: attachment; filename=\"$file_name\"\r\n";
            $fullBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $fullBody .= $file_data . "\r\n";
        }
    }
}

$fullBody .= "--$boundary--";

mail($to, $subject, $fullBody, $headers);

echo "<h2>Hvala! Vaše sporočilo je bilo uspešno poslano.</h2>";
echo "<a href='index.html'>Nazaj na stran</a>";
?>
