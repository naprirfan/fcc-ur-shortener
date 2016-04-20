module.exports = function(num) {
	var table = 
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var r = num % 62;
    var res = table.charAt(r);
    var q = Math.floor(num / 62);
    while (q)
    {
      r = q % 62;
      q = Math.floor(q / 62);
      res = table.charAt(r) + res;
    }
    return res;
}