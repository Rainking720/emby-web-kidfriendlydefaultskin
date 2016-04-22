define(['loading', 'alphapicker', './../components/horizontallist', './../components/tabbedpage', 'backdrop', './../components/listview', 'imageLoader', 'itemShortcuts', 'scroller', './../components/focushandler'], function (loading, alphaPicker, horizontalList, tabbedPage, backdrop, listview, imageLoader, itemShortcuts, scroller, focusHandler) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            if (!self.tabbedPage) {
                loading.show();
                //renderTabs(view, params.tab, self, params);
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

            Emby.Models.items({
                StartIndex: 0,
                Limit: 10000,
                ParentId: params.parentid,
                IncludeItemTypes: "Folder,Movie",
                Recursive: false,
                SortBy: "IsFolder,SortName",
                Fields: "SortName"
            })//Emby.Models.children(item, options)
            .then(function (result) {

                loading.hide();
                //if (!result.Items.length) {
                //    section.classList.add('hide');
                //    return;
                //}

                section.classList.remove('hide');

                //if (skinSettings.enableAntiSpoliers()) {

                //    var isFirstUnseen = true;
                //    result.Items.forEach(function (item) {

                //        if (item.UserData && !item.UserData.Played) {

                //            if (!isFirstUnseen) {
                //                item.Overview = null;
                //            }
                //            isFirstUnseen = false;
                //        }
                //    });
                //}

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
            });
        }

        function renderTabs(view, initialTabId, pageInstance, params) {

            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.contentScrollSlider'),
                itemClass: 'card'
            });

            var tabs = [
            {
                Name: Globalize.translate('Movies'),
                Id: "movies"
            }
            ];

            var tabbedPageInstance = new tabbedPage(view, {
                alphaPicker: self.alphaPicker
            });

            tabbedPageInstance.loadViewContent = loadViewContent;
            tabbedPageInstance.params = params;
            tabbedPageInstance.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPageInstance;

            var viewNames = view.querySelector('.userViewNames');
            viewNames.style.display = "none";
        }

        function loadViewContent(page, id, type) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                renderMovies(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);

                self.alphaPicker.visible(true);
                self.alphaPicker.enabled(true);
            });
        }

        function renderMovies(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Folder,Movie",
                        Recursive: false,
                        SortBy: "IsFolder,SortName",
                        Fields: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }
    }

});