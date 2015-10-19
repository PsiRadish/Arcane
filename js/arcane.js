
$(document).ready(function()
{
    //// Weird things happen with portals when height not explicitly defined
    function size()
    {
        $('.portal').each(function()
        {
            var $this = $(this);
            
            $this.removeAttr('style');
            $this.height($this.outerHeight(false));
        });
    }
    // call it all the time
    $(window).on('resize', size);
    // and right now
    size();
    
    
    //// Immediately remove focus from clicked links and buttons
    $('a, button, input[type="button"], input[type="reset"], input[type="submit"], .button').on("click", function()
    {
        $(this).blur();
    });
    
    
    //// Select box
    /*$('select').on("click", function(e)
    {
        e.preventDefault();
        
        
    });*/
});
