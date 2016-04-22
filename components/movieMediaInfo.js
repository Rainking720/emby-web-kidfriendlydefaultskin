define(['datetime', 'coreIcons'], function (datetime) {

    function getMediaInfoHtml(item, options) {
        var html = '';

        var miscInfo = [];
        options = options || {};
        var text, date, minutes;

        if (item.Type == "Season" || item.Type == "Episode" || item.Type == "Series") {

            var logoImageUrl = Emby.Models.logoImageUrl(item, {
            });

            var className = "selectedItemInfoLogoSeries";
            if (item.Type == "Episode")
                className = "selectedItemInfoLogoSeriesEpisode";

            if (logoImageUrl) {
                var logoHtml = '<div class="' + className + '" style="background-image:url(\'' + logoImageUrl + '\');"></div>';

                if (item.Type == "Series") {
                    logoHtml = '<div class="' + className + '" style="position: absolute;left: 330px;top: 75px;background-image:url(\'' + logoImageUrl + '\');"></div>';
                }

                miscInfo.push({ text: logoHtml, style: '' });
            }
        }

        if (item.CriticRating) {
            miscInfo.push({ text: getStarIconsHtml(item), style: 'float: left;' });

            if (item.CriticRating >= 60) {
                miscInfo.push({ text: '<div class="movieMediaInfoItem criticRating criticRatingFresh">' + item.CriticRating + '</div>', style: '' });
            } else {
                miscInfo.push({ text: '<div class="movieMediaInfoItem criticRating criticRatingRotten">' + item.CriticRating + '</div>', style: '' });
            }
        }
        else {
            miscInfo.push({ text: getStarIconsHtml(item), style: '' });

        }

        if (item.OfficialRating && item.Type !== "Season" && item.Type !== "Episode") {
            if (item.OfficialRating == "R")
                miscInfo.push({ text: '<div class="RRatedInfo"></div>', style: 'position: absolute;right: 15px;top: 25px;' });
            else if (item.OfficialRating == "G")
                miscInfo.push({ text: '<div class="GRatedInfo"></div>', style: 'position: absolute;right: 15px;top: 25px;' });
            else if (item.OfficialRating == "PG")
                miscInfo.push({ text: '<div class="PGRatedInfo"></div>', style: 'position: absolute;right: 15px;top: 25px;' });
            else if (item.OfficialRating == "PG-13")
                miscInfo.push({ text: '<div class="PG-13RatedInfo"></div>', style: 'position: absolute;right: 15px;top: 25px;' });
        }

        if (item.HasSubtitles && options.subtitles !== false) {
            if (item.Type == "Episode")
                miscInfo.push({ text: '<iron-icon class="movieMediaInfoItem closedCaptionIcon" icon="core:closed-caption"></iron-icon>', style: 'position: absolute;bottom: 90px;right: -15px;' });
            else
                miscInfo.push({ text: '<iron-icon class="movieMediaInfoItem closedCaptionIcon" icon="core:closed-caption"></iron-icon>', style: 'position: absolute;bottom: 15px;right: 15px;' });
        }

        if (item.RunTimeTicks && item.Type != "Series" && options.runtime !== false) {

            if (item.Type == "Audio") {

                miscInfo.push({ text: datetime.getDisplayRunningTime(item.RunTimeTicks), style: '' });

            } else {
                minutes = item.RunTimeTicks / 600000000;

                minutes = minutes || 1;
                if (item.Type == "Episode")
                    miscInfo.push({ text: Math.round(minutes) + " mins", style: 'position: absolute;right: 15px;bottom: 55px;' });
                else
                    miscInfo.push({ text: Math.round(minutes) + " mins", style: 'position: absolute;right: 15px;bottom: 118px;' });

                var endTimeString = getEndsAt(item);
                if (item.Type == "Episode")
                    miscInfo.push({ text: endTimeString, style: 'color:#9e9f9f;position: absolute;right: 15px;bottom: 15px;' });
                else
                    miscInfo.push({ text: endTimeString, style: 'color:#9e9f9f;position: absolute;right: 15px;bottom: 76px;' });

            }
        }


        var genres = item.Genres || [];
        if (item.Type == "Series" || item.Type == "Season") {
            if (genres.length > 2) {
                genres = [];
                genres[0] = item.Genres[0];
                genres[1] = item.Genres[1];
            };
        }
        else if (item.Type == "Episode")
            genres = [];

        var genresHtml = genres.map(function (i) {
            return i;
        }).join('<span class="bulletSeparator"> &bull; </span>');

        miscInfo.push({ text: genresHtml, style: 'color: rgb(146, 147, 147);display: inline;' });

        var people = item.People || [];
        people.map(function (i) {
            if (i.Role == "Director")
                miscInfo.push({ text: i.Name, style: 'color: rgb(146, 147, 147);' });
        });

        if (item.Studios.length > 0)
            miscInfo.push({ text: item.Studios[0].Name, style: 'color: rgb(146, 147, 147);' });

        if (item.PremiereDate) {
            try {
                date = datetime.parseISO8601Date(item.PremiereDate);

                //var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

                text = dateFormat(date, "ddd dS mmm, yyyy");

                if (item.Type == "Season")
                    miscInfo.push({ text: text, style: 'position: absolute;bottom: 50px;left: 15px;' });
                else if (item.Type == "Episode")
                    miscInfo.push({ text: text, style: 'position: absolute;bottom: 55px;left: 15px;' });
                else
                    miscInfo.push({ text: text, style: 'position: absolute;bottom: 15px;left: 25px;' });

            }
            catch (e) {
                console.log("Error parsing date: " + item.PremiereDate);
            }
        }

        else if (item.StartDate) {

            try {
                date = datetime.parseISO8601Date(item.StartDate);

                text = date.toLocaleDateString();
                miscInfo.push({ text: text, style: '' });

                if (item.Type != "Recording") {
                    text = getDisplayTime(date);
                    miscInfo.push({ text: text, style: '' });
                }
            }
            catch (e) {
                console.log("Error parsing date: " + item.PremiereDate);
            }
        }

        var userData = item.UserData;
        if (userData.Played && userData.LastPlayedDate != null) {
            if (item.Type == "Episode")
                miscInfo.push({ text: '<div style="color:#00FF00">Watched ' + datetime.parseISO8601Date(userData.LastPlayedDate).toLocaleDateString() + '</div>', style: 'position: absolute;bottom: 15px;left: 15px;' });
            else
                miscInfo.push({ text: '<div style="color:#00FF00">Watched ' + datetime.parseISO8601Date(userData.LastPlayedDate).toLocaleDateString() + '</div>', style: 'position: absolute;bottom: 15px;left: 318px;' });
        }

        if (item.ProductionYear && item.Type == "Series") {

            if (item.Status == "Continuing") {
                miscInfo.push({ text: Globalize.translate('core#ValueSeriesYearToPresent', item.ProductionYear), style: '' });

            }
            else if (item.ProductionYear) {

                text = item.ProductionYear;

                if (item.EndDate) {

                    try {

                        var endYear = datetime.parseISO8601Date(item.EndDate).getFullYear();

                        if (endYear != item.ProductionYear) {
                            text += "-" + datetime.parseISO8601Date(item.EndDate).getFullYear();
                        }

                    }
                    catch (e) {
                        console.log("Error parsing date: " + item.EndDate);
                    }
                }

                miscInfo.push({ text: text, style: 'position: absolute;bottom: 15px;left: 325px;color: rgb(146,147,147);' });
            }
        }

        if (item.Type == "Season") {
            var episodes = "<span style='color:#9e9f9f'>Episodes<span>&nbsp;&nbsp;&nbsp;&nbsp;<span>" + item.RecursiveItemCount + "</span>";
            miscInfo.push({ text: episodes, style: 'position: absolute;bottom: 15px;left: 15px;' });
        }

        //if (item.Type != "Series" && item.Type != "Episode" && item.Type != "Person" && item.MediaType != 'Photo') {

        //    if (item.ProductionYear) {

        //        miscInfo.push(item.ProductionYear);
        //    }
        //    else if (item.PremiereDate) {

        //        try {
        //            text = datetime.parseISO8601Date(item.PremiereDate).getFullYear();
        //            miscInfo.push(text);
        //        }
        //        catch (e) {
        //            console.log("Error parsing date: " + item.PremiereDate);
        //        }
        //    }
        //}   

        //if (item.Video3DFormat) {
        //    miscInfo.push({ text: "3D", style: '' });
        //}

        //if (item.MediaType == 'Photo' && item.Width && item.Height) {
        //    miscInfo.push({ text: item.Width + "x" + item.Height, style: '' });
        //}

        html += miscInfo.map(function (m) {
            return getMediaInfoItem(m);
        }).join('');

        return html;
    }

    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    var masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    var i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    // Regexes and supporting functions are cached through closure
    function dateFormat(date, mask, utc) {
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(masks[mask] || mask || masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: i18n.dayNames[D],
                dddd: i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: i18n.monthNames[m],
                mmmm: i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    }

    function getEndsAt(item) {

        if (item.MediaType == 'Video' && item.RunTimeTicks) {

            if (!item.StartDate) {
                var endDate = new Date().getTime() + (item.RunTimeTicks / 10000);
                endDate = new Date(endDate);

                var displayTime = datetime.getDisplayTime(endDate);
                return displayTime;
            }
        }

        return null;
    }

    function getEndsAtFromPosition(runtimeTicks, positionTicks, includeText) {

        var endDate = new Date().getTime() + ((runtimeTicks - (positionTicks || 0)) / 10000);
        endDate = new Date(endDate);

        var displayTime = datetime.getDisplayTime(endDate);

        if (includeText === false) {
            return displayTime;
        }
        return Globalize.translate('core#EndsAtValue', displayTime);
    }

    function getMediaInfoItem(m, cssClass) {

        cssClass = cssClass ? (cssClass + ' movieMediaInfoItem') : 'movieMediaInfoItem';
        var mediaInfoText = m;

        if (typeof (m) !== 'string' && typeof (m) !== 'number') {

            if (m.html) {
                return m.html;
            }
            else if (m.cssClass) {
                mediaInfoText = m.text;
                cssClass += ' ' + m.cssClass;
            }
            else {
                if (m.style != '')
                    return '<div class="' + cssClass + '" style="' + m.style + '">' + m.text + '</div>';
                else
                    return '<div class="' + cssClass + '">' + m.text + '</div>';
            }
        }
        return '<div class="' + cssClass + '">' + mediaInfoText + '</div>';
    }

    function getStarIconsHtml(item) {

        var html = '';

        var rating = item.CommunityRating;

        if (rating) {
            html += rating + ' / 10 ' + '<div class="starRatingContainer movieMediaInfoItem">';

            for (var i = 0; i < 5; i++) {
                var starValue = (i + 1) * 2;

                if (rating < starValue - 2) {
                    html += '<iron-icon icon="core:star" class="emptyStar"></iron-icon>';
                }
                else if (rating < starValue) {
                    html += '<iron-icon icon="core:star-half"></iron-icon>';
                }
                else {
                    html += '<iron-icon icon="core:star"></iron-icon>';
                }
            }

            html += '</div>';
        }

        return html;
    }

    function dynamicEndTime(elem, item) {

        var interval = setInterval(function () {

            if (!document.body.contains(elem)) {

                clearInterval(interval);
                return;
            }

            elem.innerHTML = getEndsAt(item);

        }, 60000);
    }

    function fillMediaInfo(elem, item, options) {
        var html = getMediaInfoHtml(item, options);

        elem.innerHTML = html;

        var endsAtElem = elem.querySelector('.endsAt');
        if (endsAtElem) {
            dynamicEndTime(endsAtElem, item);
        }
    }

    function getDisplayName(item, options) {

        if (!item) {
            throw new Error("null item passed into getDisplayName");
        }

        options = options || {};

        var name = item.EpisodeTitle || item.Name || '';

        if (item.Type == "TvChannel") {

            if (item.Number) {
                return item.Number + ' ' + name;
            }
            return name;
        }
        if (options.isInlineSpecial && item.Type == "Episode" && item.ParentIndexNumber == 0) {

            name = Globalize.translate('core#ValueSpecialEpisodeName', name);

        } else if (item.Type == "Episode" && item.IndexNumber != null && item.ParentIndexNumber != null) {

            var displayIndexNumber = item.IndexNumber;

            var number = "E" + displayIndexNumber;

            if (options.includeParentInfo !== false) {
                number = "S" + item.ParentIndexNumber + ", " + number;
            }

            if (item.IndexNumberEnd) {

                displayIndexNumber = item.IndexNumberEnd;
                number += "-" + displayIndexNumber;
            }

            name = number + " - " + name;

        }

        return name;
    }

    return {
        getMediaInfoHtml: getMediaInfoHtml,
        fill: fillMediaInfo,
        getEndsAt: getEndsAt,
        getEndsAtFromPosition: getEndsAtFromPosition
    };
});