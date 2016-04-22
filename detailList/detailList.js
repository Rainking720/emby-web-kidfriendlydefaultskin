define(['loading', 'alphapicker', './../components/horizontallist', './../components/tabbedpage', 'backdrop', './../components/listview', 'imageLoader', 'itemShortcuts', 'scroller', './../components/focushandler', 'focusManager'], function (loading, alphaPicker, horizontalList, tabbedPage, backdrop, listview, imageLoader, itemShortcuts, scroller, focusHandler, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            if (!self.tabbedPage) {
                loading.show();
                renderMovieList(view, params.tab, self, params);
            }

            Emby.Page.setTitle('');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.listController) {
                self.listController.destroy();
            }
            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
        });

        function createVerticalScroller(view, pageInstance) {

            require(['scroller'], function (scroller) {

                var scrollFrame = view.querySelector('.scrollFrame');

                var options = {
                    horizontal: 0,
                    slidee: view.querySelector('.scrollSlider'),
                    scrollBy: 200,
                    speed: 270,
                    scrollWidth: 50000,
                    immediateSpeed: 100
                };

                pageInstance.verticalScroller = new scroller(scrollFrame, options);
                pageInstance.verticalScroller.init();
                initFocusHandler(view, pageInstance.verticalScroller);
            });
        }

        function initFocusHandler(view, verticalScroller) {

            var movieOverview = view.querySelector('.selectedItemOverview');
            var moviePoster = view.querySelector('.selectedItemPoster');
            var movieMediaInfo = view.querySelector('.selectedItemMediaInfo');
            var selectedMovieTitle = view.querySelector('.selectedMovieTitle');
            var selectedIndexElement = view.querySelector('.selectedIndex');

            self.focusHandler = new focusHandler({
                parent: view.querySelector('.scrollSlider'),
                scroller: verticalScroller,
                zoomScale: '1.10',
                enableBackdrops: true,
                selectedItemOverview: movieOverview,
                selectedItemPoster: moviePoster,
                selectedItemMediaInfo: movieMediaInfo,
                selectedMovieTitle: selectedMovieTitle,
                selectedIndexElement: selectedIndexElement
            });
        }

        function renderMovieList(view, initialTabId, pageInstance, params) {

            createVerticalScroller(view, self);

            var section = view.querySelector('.movieList');
            var listCount = view.querySelector('.listCount');
            var selectedMovieItemInfo = view.querySelector('.selectedMovieItemInfo');
            var moviePoster = view.querySelector('.selectedItemPoster');
            var movieOverview = view.querySelector('.selectedItemOverview');
            var selectedItemMediaInfo = view.querySelector('.selectedItemMediaInfo');
            
            Emby.Models.item(params.parentid).then(function (item) {

                var options = {
                    StartIndex: 0,
                    Limit: 10000,
                    ParentId: params.parentid,
                    IncludeItemTypes: "Folder,Movie",
                    Recursive: false,
                    SortBy: "IsFolder,SortName",
                    Fields: "SortName"
                }

                if (item.Type == "Series") {
                    options = {
                        StartIndex: 0,
                        Limit: 10000,
                        ParentId: item.Id,
                        IncludeItemTypes: "Seasons",
                        Recursive: false,
                        SortBy: "IsFolder,SortName",
                        Fields: "SortName"
                    }
                }
                else if (item.Type == "Season") {
                    selectedMovieItemInfo.classList.remove('selectedMovieItemInfo');
                    selectedMovieItemInfo.classList.add('selectedMovieItemInfoEpisode');

                    moviePoster.classList.remove('selectedItemPoster');
                    moviePoster.classList.add('selectedItemPosterEpisode');

                    movieOverview.classList.remove('selectedItemOverview');
                    movieOverview.classList.add('selectedItemOverviewEpisode');

                    selectedItemMediaInfo.classList.remove('selectedItemMediaInfo');
                    selectedItemMediaInfo.classList.add('selectedItemMediaInfoEpisode');
                    
                }
                else if (item.Type == "CollectionFolder") {
                    if (item.CollectionType == "tvshows") {
                        options = {
                            StartIndex: 0,
                            Limit: 10000,
                            ParentId: item.Id,
                            IncludeItemTypes: "Folder,Series",
                            Recursive: false,
                            SortBy: "IsFolder,SortName",
                            Fields: "SortName"
                        }
                    }
                }

                var promise = (item.Type != 'Series' && item.Type != 'Season') ?
                        Emby.Models.items(options) :
                        Emby.Models.children(item, {});

                promise.then(function (result) {

                    loading.hide();

                    section.classList.remove('hide');

                    listCount.innerHTML = result.Items.length;

                    section.innerHTML = listview.getListViewHtml(result.Items, {
                        showIndexNumber: false,
                        enableOverview: false,
                        isTitlesOnly: true,
                        enableSideMediaInfo: false
                    });

                    imageLoader.lazyChildren(section);

                    itemShortcuts.off(section);
                    itemShortcuts.on(section);

                    setTimeout(function () {
                        var firstItem = section.querySelector('.itemAction');
                        if (firstItem) {
                            focusManager.focus(firstItem);
                        }
                    }, 400);

                });
            });
        }


    }

});