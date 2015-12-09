//makelink.php
<?
$temp = file_get_contents("temp.html");
$script = ?><script type="text/javascript">var key =" <? $_POST['key']?> "</script>
   </body><?
$temp = str_replace("</body>",$script,$temp);
file_put_contents($_POST['key'].".html",$temp);
?>