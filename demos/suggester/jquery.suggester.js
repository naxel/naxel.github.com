(function($) {
    $.fn.suggester = function(data, options) {
        //public
        var defaults = {
            srHtmlID: false,
            startText: "Enter Name Here",
            emptyText: "No Results Found",
            preFill: {},
            limitText: "No More Selections Are Allowed",
            selectedItemProp: "value", //name of object property
            selectedValuesProp: "value", //name of object property
            searchObjProps: "value", //comma separated list of object property names
            queryParam: "q",
            retrieveLimit: false, //number for 'limit' param on ajax request
            extraParams: "",
            matchCase: false,
            minChars: 1,
            showAll: true,
            keyDelay: 400,
            resultsHighlight: true,
            neverSubmit: false,
            selectionLimit: false,
            showResultList: true,
            start: function() {},
            selectionClick: function(elem) {},
            selectionAdded: function(elem) {},
            selectionRemoved: function(elem) { elem.remove(); },
            formatList: false, //callback function
            beforeRetrieve: function(string) { return string; },
            retrieveComplete: function(data) { return data; },
            resultClick: function(data) {},
            resultsComplete: function() {}
        };
        var opts = $.extend(defaults, options);


        var d_type = "object";
        var d_count = 0;
        if (typeof data == "string") {
            d_type = "string";
            var req_string = data;
        } else {
            var org_data = data;
            for (k in data) if (data.hasOwnProperty(k)) {
                d_count++;
            }
        }

        /**
         * public
         *
         * @param data JSON array
         */
        this.setSuggestData = function(data) {
            d_count = 0;
            org_data = data;
            for (k in data) if (data.hasOwnProperty(k)) {
                d_count++;
            }
        };

        if ((d_type == "object" && d_count >= 0) || d_type == "string") {


            if (opts.showAll) {
                $(document).on("click.sugester", function(e) {
                    $('.sr-results').hide();
                });
                var stopPropagation = function(e) {
                    if (e.stopPropagation) {
                        // W3C:
                        e.stopPropagation();
                    } else {
                        // Internet Explorer:
                        e.cancelBubble = true;
                    }
                }
                $(document).on("click.sugester", '.sr-results', stopPropagation);
                $(document).on("click.sugester", '.drop-menu', stopPropagation);
            }

            return this.each(function(x) {
                if (!opts.srHtmlID) {
                    x = x + "" + Math.floor(Math.random() * 100); //this ensures there will be unique IDs on the page if suggester() is called multiple times
                    var x_id = "sr-input-" + x;
                } else {
                    x = opts.srHtmlID;
                    var x_id = x;
                }
                opts.start.call(this);
                var input = $(this);
                input.attr("autocomplete", "off").addClass("sr-input").attr("id", x_id).val(opts.startText);
                var input_focus = false;

                // Setup basic elements and render them to the DOM

                input.wrap('<div class="suggest-main-container"></div>')
                    .wrap('<div class="suggest-container"></div>')
                    .wrap('<ul class="sr-selections" id="sr-selections-' + x + '"></ul>')
                    .wrap('<li class="sr-original" id="sr-original-' + x + '"></li>');
                var selections_holder = $("#sr-selections-" + x);
                var suggest_main_container = $('.suggest-main-container');
                var suggest_container = $('.suggest-container');
                var org_li = $("#sr-original-" + x);
                var results_holder = $('<div class="sr-results" id="sr-results-' + x + '"></div>').hide();
                var results_ul = $('<ul class="sr-list"></ul>');
                var values_input = $('<input type="hidden" class="sr-values" name="sr_values_' + x + '" id="sr-values-' + x + '" />');
                var prefill_value = "";

                suggest_main_container.append('<div class="clear"></div>');
                selections_holder.after('<div class="clear"></div>');

                if (opts.showAll) {
                    var all_results = $('<div class="drop-menu"><span class="icon">&#9660;</span></div>');
                    selections_holder.after(all_results);
                    all_results.click(function() {
                        if (input.val().length == 0) {
                            input_focus = true;
                            input.focus();
                            displayAll(data);
                        } else {
                            input.focus();
                        }
                    });
                }

                selections_holder.css("width", suggest_container.width() - 21);

                if (typeof opts.preFill == "string") {
                    var vals = opts.preFill.split(",");
                    for (var i = 0; i < vals.length; i++) {
                        var v_data = {};
                        v_data[opts.selectedValuesProp] = vals[i];
                        if (vals[i] != "") {
                            add_selected_item(v_data, "000" + i);
                        }
                    }
                    prefill_value = opts.preFill;
                } else {
                    prefill_value = "";
                    var prefill_count = 0;
                    for (k in opts.preFill) if (opts.preFill.hasOwnProperty(k)) {
                        prefill_count++;
                    }
                    if (prefill_count > 0) {
                        for (var i = 0; i < prefill_count; i++) {
                            var new_v = opts.preFill[i][opts.selectedValuesProp];
                            if (new_v == undefined) { new_v = ""; }
                            prefill_value = prefill_value + new_v + ",";
                            if (new_v != "") {
                                add_selected_item(opts.preFill[i], "000" + i);
                            }
                        }
                    }
                }
                if (prefill_value != "") {
                    input.val("");
                    var lastChar = prefill_value.substring(prefill_value.length - 1);
                    if (lastChar != ",") {
                        prefill_value = prefill_value + ",";
                    }
                    values_input.val(prefill_value);
                    $("li.sr-selection-item", selections_holder).addClass("blur").removeClass("selected");
                }
                input.after(values_input);
                selections_holder.click(function() {
                    input_focus = true;
                    input.focus();
                }).mousedown(function() { input_focus = false; });
                suggest_container.after(results_holder);

                var timeout = null;
                var prev = "";
                var tab_press = false;


                // Handle input field events
                input.focus(function() {
                    if ($(this).val() == opts.startText && values_input.val() == "") {
                        $(this).val("");
                    } else if (input_focus) {
                        $("li.sr-selection-item", selections_holder).removeClass("blur");
                        if ($(this).val() != "") {
                            results_ul.css("width", suggest_container.width() + 10);
                            results_holder.show();
                        }
                    }
                    input_focus = true;
                    return true;
                }).blur(function() {
                            if ($(this).val() == "" && values_input.val() == "" && prefill_value == "") {
                                $(this).val(opts.startText);
                            } else if (input_focus) {
                                $("li.sr-selection-item", selections_holder).addClass("blur").removeClass("selected");
                                //results_holder.hide();
                            }
                        })
                    .keydown(function(e) {
                        // track last key pressed
                        lastKeyPressCode = e.keyCode;
                        first_focus = false;
                        switch (e.keyCode) {
                            case 38: // up
                                e.preventDefault();
                                moveSelection("up");
                                break;
                            case 40: // down
                                e.preventDefault();
                                moveSelection("down");
                                break;
                            case 8:  // delete
                                console.log('delete');
                                if (input.val() == "") {
                                    console.log('1');
                                    var last = values_input.val().split(",");
                                    last = last[last.length - 2];
                                    selections_holder.children().not(org_li.prev()).removeClass("selected");
                                    if (org_li.prev().hasClass("selected")) {
                                        values_input.val(values_input.val().replace(last + ",", ""));
                                        opts.selectionRemoved.call(this, org_li.prev());
                                    } else {
                                        opts.selectionClick.call(this, org_li.prev());
                                        org_li.prev().addClass("selected");
                                    }
                                }
                                if (input.val().length == 1) {
                                    results_holder.hide();
                                    prev = "";
                                }
                                if ($(":visible", results_holder).length > 0) {
                                    if (timeout) { clearTimeout(timeout); }
                                    timeout = setTimeout(function() { keyChange(); }, opts.keyDelay);
                                }
                                break;
                            case 9:
                            case 188:  // tab or comma
                                tab_press = true;
                                var i_input = input.val().replace(/(,)/g, "");
                                if (i_input != "" && values_input.val().search(i_input + ",") < 0 && i_input.length >= opts.minChars) {
                                    e.preventDefault();
                                    var n_data = {};
                                    n_data[opts.selectedItemProp] = i_input;
                                    n_data[opts.selectedValuesProp] = i_input;
                                    var lis = $("li", selections_holder).length;
                                    add_selected_item(n_data, "00" + (lis + 1));
                                    input.val("");
                                }
                            case 13: // return
                                tab_press = false;
                                var active = $("li.active:first", results_holder);
                                if (active.length > 0) {
                                    active.click();
                                    results_holder.hide();
                                }
                                if (opts.neverSubmit || active.length > 0) {
                                    e.preventDefault();
                                }
                                break;
                            default:
                                if (opts.showResultList) {
                                    if (opts.selectionLimit && $("li.sr-selection-item", selections_holder).length >= opts.selectionLimit) {
                                        results_ul.html('<li class="sr-message">' + opts.limitText + '</li>');
                                        results_holder.show();
                                    } else {
                                        if (timeout) { clearTimeout(timeout); }
                                        timeout = setTimeout(function() { keyChange(); }, opts.keyDelay);
                                    }
                                }
                                break;
                        }
                    });

                function keyChange() {
                    // ignore if the following keys are pressed: [del] [shift] [capslock]
                    if (lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32)) { return results_holder.hide(); }
                    var string = input.val().replace(/[\\]+|[\/]+/g, "");
                    if (string == prev) {
                        return;
                    }
                    prev = string;
                    if (string.length >= opts.minChars) {
                        selections_holder.addClass("loading");
                        if (d_type == "string") {
                            var limit = "";
                            if (opts.retrieveLimit) {
                                limit = "&limit=" + encodeURIComponent(opts.retrieveLimit);
                            }
                            if (opts.beforeRetrieve) {
                                string = opts.beforeRetrieve.call(this, string);
                            }
                            $.getJSON(req_string + "?" + opts.queryParam + "=" + encodeURIComponent(string) + limit + opts.extraParams, function(data) {
                                d_count = 0;
                                var new_data = opts.retrieveComplete.call(this, data);
                                for (k in new_data) if (new_data.hasOwnProperty(k)) {
                                    d_count++;
                                }
                                processData(new_data, string);
                            });
                        } else {
                            if (opts.beforeRetrieve) {
                                string = opts.beforeRetrieve.call(this, string);
                            }
                            processData(org_data, string);
                        }
                    } else {
                        selections_holder.removeClass("loading");
                        results_holder.hide();
                    }
                }

                var num_count = 0;

                function processData(data, query) {
                    if (!opts.matchCase) { query = query.toLowerCase(); }
                    var matchCount = 0;
                    results_holder.html(results_ul.html("")).hide();
                    for (var i = 0; i < d_count; i++) {
                        var num = i;
                        num_count++;
                        var forward = false;
                        if (opts.searchObjProps == "value") {
                            var str = data[num].value;
                        } else {
                            var str = "";
                            var names = opts.searchObjProps.split(",");
                            for (var y = 0; y < names.length; y++) {
                                var name = $.trim(names[y]);
                                str = str + data[num][name] + " ";
                            }
                        }
                        if (str) {
                            if (!opts.matchCase) { str = str.toLowerCase(); }
                            if (str.search(query) != -1 && values_input.val().search(data[num][opts.selectedValuesProp] + ",") == -1) {
                                forward = true;
                            }
                        }
                        if (forward) {
                            var formatted = $('<li class="sr-result-item" id="sr-result-item-' + num + '"></li>')
                                .click(
                                    function() {
                                        var raw_data = $(this).data("data");
                                        var number = raw_data.num;
                                        if ($("#sr-selection-" + number, selections_holder).length <= 0 && !tab_press) {
                                            var data = raw_data.attributes;
                                            input.val("").focus();
                                            prev = "";
                                            add_selected_item(data, number);
                                            opts.resultClick.call(this, raw_data);
                                            results_holder.hide();
                                        }
                                        tab_press = false;
                                    }
                            ).mousedown(
                                function() { input_focus = false; }
                            ).mouseover(
                                function() {
                                    $("li", results_ul).removeClass("active");
                                    $(this).addClass("active");
                                }
                            ).data("data", {attributes: data[num], num: num_count});
                            var this_data = $.extend({}, data[num]);
                            if (!opts.matchCase) {
                                var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "gi");
                            } else {
                                var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "g");
                            }

                            if (opts.resultsHighlight) {
                                this_data[opts.selectedItemProp] = this_data[opts.selectedItemProp].replace(regx, "<em>$1</em>");
                            }
                            if (!opts.formatList) {
                                formatted = formatted.html(this_data[opts.selectedItemProp]);
                            } else {
                                formatted = opts.formatList.call(this, this_data, formatted);
                            }
                            results_ul.append(formatted);
                            delete this_data;
                            matchCount++;
                            if (opts.retrieveLimit && opts.retrieveLimit == matchCount) { break; }
                        }
                    }
                    selections_holder.removeClass("loading");
                    if (matchCount <= 0) {
                        results_ul.html('<li class="sr-message">' + opts.emptyText + '</li>');
                    }
                    results_ul.css("width", suggest_container.width() + 10);
                    results_holder.show();
                    opts.resultsComplete.call(this);
                }

                function add_selected_item(data, num) {
                    values_input.val(values_input.val() + data[opts.selectedValuesProp] + ",");
                    var item = $('<li class="sr-selection-item" id="sr-selection-' + num + '"></li>').click(function() {
                        opts.selectionClick.call(this, $(this));
                        selections_holder.children().removeClass("selected");
                        $(this).addClass("selected");
                    }).mousedown(function() { input_focus = false; });
                    var close = $('<a class="sr-close">&times;</a>').click(function() {
                        values_input.val(values_input.val().replace(data[opts.selectedValuesProp] + ",", ""));
                        opts.selectionRemoved.call(this, item);
                        input_focus = true;
                        input.focus();
                        return false;
                    });
                    org_li.before(item.html(data[opts.selectedItemProp]).prepend(close));
                    opts.selectionAdded.call(this, org_li.prev());
                }

                function moveSelection(direction) {
                    if ($(":visible", results_holder).length > 0) {
                        var lis = $("li", results_holder);
                        if (direction == "down") {
                            var start = lis.eq(0);
                        } else {
                            var start = lis.filter(":last");
                        }
                        var active = $("li.active:first", results_holder);
                        if (active.length > 0) {
                            if (direction == "down") {
                                start = active.next();
                            } else {
                                start = active.prev();
                            }
                        }
                        lis.removeClass("active");
                        start.addClass("active");
                    }
                }

                function displayAll(data) {
                    results_holder.html(results_ul.html("")).hide();
                    for (var i = 0; i < d_count; i++) {
                        var num = i;
                        num_count++;

                        var formatted = $('<li class="sr-result-item" id="sr-result-item-' + num + '"></li>').click(function() {
                            var raw_data = $(this).data("data");
                            var number = raw_data.num;
                            if ($("#sr-selection-" + number, selections_holder).length <= 0 && !tab_press) {
                                var data = raw_data.attributes;
                                input.val("").focus();
                                prev = "";
                                add_selected_item(data, number);
                                opts.resultClick.call(this, raw_data);
                                results_holder.hide();
                            }
                            tab_press = false;
                        }).mousedown(function() {
                                         input_focus = false;
                                     }).mouseover(function() {
                                                      $("li", results_ul).removeClass("active");
                                                      $(this).addClass("active");
                                                  }).data("data", {attributes: data[num], num: num_count});


                        var this_data = $.extend({}, data[num]);//?


                        if (!opts.formatList) {
                            formatted = formatted.html(this_data[opts.selectedItemProp]);
                        } else {
                            formatted = opts.formatList.call(this, this_data, formatted);
                        }
                        results_ul.append(formatted);

                    }
                    selections_holder.removeClass("loading");
                    results_ul.css("width", suggest_container.width() + 10);
                    results_holder.show();
                    opts.resultsComplete.call(this);
                }

            });
        }
    }
})(jQuery);  	