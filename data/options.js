var alllangs = {}
var locales = {}

function save_options() {
    var fr_lang = $("#from-lang").val()
    var to_lang = $("#to-lang").val()

    self.port.emit('simple-storage-f-lang', fr_lang)
    self.port.emit('simple-storage-t-lang', to_lang)
}

function restore_options() {
    self.port.emit('simple-storage-get-f-t-lang')
}

function enable_disable() {
    self.port.emit('change-enable-state', false)
}

self.port.on("recieve-stored-langs", function(stored_langs) {
    if (stored_langs["fr_lang"] && stored_langs["to_lang"]) {
        $("#from-lang").val(stored_langs["fr_lang"])
        $("#to-lang").val(stored_langs["to_lang"])
    }
});

self.port.on("recieve-enable-state",function(enable_state) {
    if (enable_state) {
        $("#enable-button").html("On")
        $("#enable-button").addClass("active")
    } else {
        $("#enable-button").html("Off")
    }
});

function download_languages() {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "http://apy.projectjj.com/listPairs", false );
    xmlHttp.send(null);
    var langs = JSON.parse(xmlHttp.responseText);
    langs = langs["responseData"]
    var lang_codes = []
    
    $.each(langs, function(inx, rd){
        if (rd["sourceLanguage"] in alllangs) {
            alllangs[rd["sourceLanguage"]].push(rd["targetLanguage"])   
        } else {
            alllangs[rd["sourceLanguage"]] = [rd["targetLanguage"]]   
        }
        lang_codes.push(rd["sourceLanguage"])
        lang_codes.push(rd["targetLanguage"])
    });
    
    var reqUrl = "http://apy.projectjj.com/listLanguageNames?locale=en&languages="
    
    $.each(lang_codes, function(inx, code){
        reqUrl = reqUrl + code
        if (inx < lang_codes.length - 1) {
            reqUrl = reqUrl + "+"
        }
    });
    
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", reqUrl, false );
    xmlHttp.send(null);
    var localedict = JSON.parse(xmlHttp.responseText);
    locales = localedict
    
    var to_lang = {}
    $.each(Object.keys(alllangs), function(inx, lang) {
        var text_lang = locales[lang];
        if(!text_lang) {
            var lang_arr = lang.split("_")
            text_lang = locales[lang_arr[0]]
            text_lang = text_lang + " " + lang_arr[1]
        }
        
        $("#from-lang").append("<option value=\"" + lang + "\">" + text_lang + "</option>")
        $.each(alllangs[lang], function(ix, l) {
            if (!(l in to_lang)) {
                var to_text_lang = locales[l];
                if(!to_text_lang) {
                    var to_lang_arr = l.split("_")
                    to_text_lang = locales[to_lang_arr[0]]
                    to_text_lang = to_text_lang + " " + to_lang_arr[1]
                }
                $("#to-lang").append("<option value=\"" + l + "\">" + to_text_lang + "</option>")
                to_lang[l] = 1
            }
        });
    });
    
    update_selectboxes();
}

function enable_disable() {
    if ($("#enable-button").html() == "On") {
        self.port.emit("change-enable-state", false)  
        $("#enable-button").html("Off")
    } else {
        self.port.emit("change-enable-state", true)
        $("#enable-button").html("On")
    }
}

function update_selectboxes() {
    $("#to-lang option").attr("disabled","disabled")
    
    $.each(alllangs[$("#from-lang").val()], function(inx, lang) {
        $("#to-lang option[value=\'" + lang + "\']").removeAttr('disabled');     
    });
    
    var new_list = $('#to-lang option[disabled!=\'disabled\']');    
    $.merge(new_list,$('#to-lang option[disabled=\'disabled\']'))
    $("#to-lang").empty().append(new_list);
    $("#to-lang").val($("#to-lang option[disabled!=\'disabled\']").val())
}

$("#from-lang").change(function() {
    update_selectboxes()
    save_options()
});

$("#to-lang").change(function() {
    save_options()
});

$("#enable-button").click(function() {
    enable_disable()
})

self.port.on("showpopup", function() {
    $("#from-lang").empty()
    $("#to-lang").empty()
    download_languages()
    restore_options()
    self.port.emit("get-enable-state")
});