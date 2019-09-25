// Callete - Version :version_number:
// ===============================================================

const app = {

    init: function() {
        window.routes = :routes:;
        window.components = :components:;
        window.markdown = :markdown:;

        window['404'] = :404page:;

        window.currentPath = window.location.pathname;
        if (window.currentPath[window.currentPath.length-1] == '/' && window.currentPath != "/") {
            window.currentPath = window.currentPath.substr(0,window.currentPath.length - 1);
        }
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
        
        var images = document.getElementsByTagName("img");

        for (var i = 0; i < images.length; i++) {
            let img = images[i];

            let data_src = img.src;
            img.removeAttribute('src');
            img.setAttribute('data-src', data_src);
            img.classList.add('lazyLoadImage')
        }

        let keysUsed = []

        Object.keys(window.components).forEach(function(key) {

            let els = document.getElementsByTagName(key)
            
            for (let i = 0; i < els.length; i++) {
                const el = els[i];
                el.innerHTML = window.components[key].html;
                if (!keysUsed.includes(key)){
                    keysUsed.push(key);
                }
            }

            for (let j = 0; j < keysUsed.length; j++) {
                const elem = keysUsed[j];
                document.getElementById('mainStyles').innerHTML += window.components[elem].css;
            }
          
          });

          let els = document.getElementsByTagName('Markdown')
            
            for (let i = 0; i < els.length; i++) {
                const el = els[i];
                el.innerHTML = window.markdown[el.getAttribute('file')];
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
        if (routeUrl[routeUrl.length-1] == '/') {
            routeUrl = routeUrl.substr(0,routeUrl.length - 1);
        }

        return routeUrl;
    },

    handlePageChange: function(route) {
        window.currentPath = route;

        if(historyType == 'hash'){
            window.location.hash = '/' + route;
        } else {
            window.history.pushState({}, route.substr(1,route.length), window.location.origin + route);
        }
        app.update()
    },

    hashRouter: function(evt) {
        const url = window.location.hash.slice(1) || "/";
        app.update();
        return url;
    }

};

window.onpopstate = () => {
    window.currentPath = window.location.pathname;

    app.update();
}

if(historyType == 'hash'){
    window.addEventListener('hashchange', app.hashRouter);
}

window.addEventListener('load', function() {
    app.init();

    app.update();

    let lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazyLoadImage"
    });
});