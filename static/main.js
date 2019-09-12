// Callete - Version :version_number:
// ===============================================================

const app = {

    init: function() {
        window.routes = :routes:;

        window['404'] = :404page:;

        window.currentPath = window.location.pathname;
    },

    update: function() {
        if (window.routes[window.currentPath]) {
            this.loadPage(window.routes[window.currentPath]);
        } else {
            this.loadPage(window['404']);
        }

        var anchors = document.getElementsByTagName("a");

        for (var i = 0; i < anchors.length; i++) {
            if (this.handleRoute(anchors[i].href) != false) {
                anchors[i].href = "javascript:app.handlePageChange('" + this.handleRoute(anchors[i].href) + "');";
            }
        }
    },

    loadPage: function(pageContent) {
        let mainContent = document.getElementById('main-content');

        mainContent.innerHTML = pageContent.html;

        let mainStyles = document.getElementsByTagName('style')[0];

        mainStyles.innerHTML = pageContent.css;
    },

    handleRoute: function(routeUrl) {
        routeUrl = routeUrl.replace(window.location.origin, '')
        if (routeUrl.substr(0,1) != '/') {
            routeUrl = '/' + routeUrl;
        }
        if (routeUrl.substr(0,8) == 'https://' || routeUrl.substr(0,7) == 'http://' || routeUrl.substr(0,2) == '//' || routeUrl.substr(0,1) == '#') {
            routeUrl = false;
        }

        return routeUrl;
    },

    handlePageChange: function(route) {
        window.currentPath = route;

        window.history.pushState({}, route.substr(1,route.length), window.location.origin + route);

        app.update()
    }

};

window.onpopstate = () => {
    window.currentPath = window.location.pathname;

    app.update();
}

window.addEventListener('load', function() {
    app.init();

    app.update();
});