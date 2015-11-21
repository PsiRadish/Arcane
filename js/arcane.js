
//// Weird things happen with some containers when height not explicitly defined
// var explicitHeightElements = '.portal, .pannus';
function arcaneResize()
{
    $('.portal').each(function()
    {
        var $this = $(this);
        
        $this.removeAttr('style');
        $this.height($this.outerHeight(false));
        
        // reHeight(this);
    });
    
    $('.pannus').each(function()
    {
        var $this = $(this);
        var selectedContent = $this.children('.selected').first();
        
        if (selectedContent.length > 0)
            $this.height(selectedContent.outerHeight(false));
        
        // reHeight(this);
    });
}
// function reHeight(elem)
// {
//     var $elem = $(elem);
    
//     $elem.removeAttr('style');
//     $elem.height($elem.outerHeight(false));
// }

//* load SVG lightning bolt for later use
var svgBolt = null;
jQuery.get("/img/bolt.svg", function(data)
{
    // Get the SVG tag, ignore the rest
    svgBolt = jQuery(data).find('svg');
}, 'xml');
//*/

$(document).ready(function()
{
    //// Do resize things on resize
    $(window).on('resize', arcaneResize);
    // and when the page finishes loading
    $('body')[0].onload = arcaneResize;
    
    
    //// Immediately remove focus from clicked links and buttons
    $('a, button, input[type="button"], input[type="reset"], input[type="submit"], .boton').on("click", function()
    {
        $(this).blur();
    });
    
    
    //// For each inline-spread list, set li widths so they appear evenly spread out
    $('ul.inline-spread, ol.inline-spread').each(function()
    {
        var listItems = $(this).children('li');
        var listLength = listItems.length;
        
        listItems.each(function(index)
        {
            var liWidth = 100;
            
            if (listLength < 4)
            {
                liWidth = 100 / listLength;
            }
            else // get fancier at 4 and above
            {
                // calculate width of middle li's
                var middleLiWidth = 100 / (listLength - 1);
                
                if (index == 0 || index == listLength-1)
                {   // first and last li have half the width of the other li's
                    liWidth = middleLiWidth / 2;
                }
                else // middle li
                {
                    liWidth = middleLiWidth;
                }
            }
            
            $(this).css('width', liWidth + "%");
        });
    });
    
    // Tab widget
    var tabTransitionDur = 300; // ms
    
    $('.arcane-tabs').each(function()
    {
        var selectedContents = null;
        
        var tabWidget = $(this);
        
        var tabList = tabWidget.children('ul, ol').first();
        tabList.addClass("tab-list");
        
        var tabs = tabList.find('> li > a');
        var tabContents = tabs.map(function()
        {
            var tab = $(this);
            // might as well do some needed modifications to the anchor element while I've got it
            tab.addClass("boton no-border");
            tab.wrapInner('<span class="power-words"></span>');
            
            // now we query for the contents element
            var contentsSelector = tab.attr('href');
            var contents = tabWidget.children(contentsSelector).first();
            
            if (contents.length == 0) // contents not found
            {
                tab.prop("disabled", true);
            }
            else
            {
                if (tab.is('.selected')) // tab is pre-selected in markup
                {
                    contents.addClass("selected");
                    selectedContents = contents;
                }
                else
                    contents.removeClass("selected"); // just in case
            }
            
            return contents.get();
        });
        
        // new container for tab contents
        var tabPanel = $('<div class="pannus"></div>');
        
        if (tabWidget.is('.no-initial-tab')) // no tab starts out selected
        {
            tabWidget.removeClass("no-initial-tab");
            
            // remove "selected" class from tabs and tab contents
            tabs.removeClass("selected");
            tabContents.removeClass("selected");
            
            // look for default content to fill the content pane until a tab is selected
            var defaultContents = tabWidget.children('.defallita').first().addClass("selected");
            if (defaultContents.length > 0)
            {
                $.merge(tabContents, defaultContents);
                selectedContents = defaultContents;
            }
            
            tabPanel.addClass("no-tab-selected");
        }
        
        tabContents.addClass("tab-content");
        // console.log("tabContents", tabContents);
        
        // move tab contents underneath the new element
        tabContents.detach();
        tabContents.appendTo(tabPanel);        
        tabPanel.appendTo(tabWidget);
        
        if (selectedContents)
        {   // initialize tabPanel height
            tabPanel.height(selectedContents.outerHeight(false));
        }
        
        //// Tab click event handling
        var contentsCooldownIDs = {};
        var panelCooldownID = null;
        
        // listener function
        function tabClick(e)
        {
            e.preventDefault();
            var newTab = $(this);
            
            if (newTab.is('.selected') || newTab.prop("disabled"))
                return;
            
            var newContents = tabContents.filter(newTab.attr("href")).first();
            
            var oldTab = tabs.filter('.selected').first();
            var oldContents = null;
            var cooldownKey = null;
            if (oldTab.length > 0)
            {
                oldContents = tabContents.filter(oldTab.attr("href")).first();
                cooldownKey = oldTab.attr("href");
            }
            else
            {
                oldContents = tabContents.filter('.selected').first();
                cooldownKey = oldContents.attr('class').split(" ")[0];
            }
            
            oldTab.removeClass("selected");
            oldContents.addClass("switching");
            oldContents.removeClass("selected");
            contentsCooldownIDs[cooldownKey] = window.setTimeout(function()
            {
                oldContents.removeClass("switching");
                contentsCooldownIDs[cooldownKey] = null;
            }, tabTransitionDur);
                        
            newTab.addClass("selected");
            newContents.addClass("selected");
            newContents.removeClass("switching");
            cooldownKey = newTab.attr("href");
            if (cooldownKey in contentsCooldownIDs && contentsCooldownIDs[cooldownKey] != null) // contents were still fading out when they became selected again
            {
                window.clearTimeout(contentsCooldownIDs[cooldownKey]); // clear "switching" timeout, already removed it
                contentsCooldownIDs[cooldownKey] = null;
            }
            
            tabPanel.removeClass("no-tab-selected");
            tabPanel.addClass("switching");
            if (panelCooldownID != null) // still shining from another recent switch
            {
                window.clearTimeout(panelCooldownID); // clear old "switching" timer, gonna start a new one
            }
            panelCooldownID = window.setTimeout(function() // delay removing "switching" class
            {
                tabPanel.removeClass("switching");
                panelCooldownID = null;
            }, tabTransitionDur);
            
            // explicitly set container height for transition animation
            tabPanel.height(newContents.outerHeight(false));
        }
        
        // add listener to tabs
        tabs.each(function()
        {
            $(this).on("click", tabClick);
        });
    });
    /*
    • When setting timeout for start of fade-in of new text, store timeoutID
      Assign timeoutID to null when timeout finished
      If timeoutID not null when about to set new one, do window.clearTimeout(timeoutID) before calling window.setTimeout() again 
    */
    
    
    //// Select box
    /*$('select').on("click", function(e)
    {
        e.preventDefault();
        
    });*/
    
    
    //// Set button role on button-ified anchor tags (unless role already defined)
    $('a.boton:not([role])').attr('role', "button");
});
