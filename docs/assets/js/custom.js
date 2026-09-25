(function () {
  "use strict";

  const modules = [
    {
      path: "00-el-curso",
      title: "El curso"
    },
    {
      path: "01-fundamentos-telemetria",
      title: "Fundamentos de telemetría"
    },
    {
      path: "02-grafana",
      title: "Grafana"
    },
    {
      path: "03-prometheus-fuentes-datos",
      title: "Prometheus y fuentes de datos"
    },
    {
      path: "04-dashboards-visualizacion",
      title: "Dashboards y visualización"
    },
    {
      path: "05-anotaciones-alertas",
      title: "Anotaciones y alertas"
    },
    {
      path: "06-proyecto-final",
      title: "Proyecto final"
    },
    {
      path: "07-referencia-y-resolucion",
      title: "Referencia y resolución"
    }
  ];

  function getModuleTitle() {
    const path = window.location.pathname;

    const selectedModule = modules.find(function (module) {
      return path.includes("/" + module.path + "/");
    });

    return selectedModule ? selectedModule.title : "Curso de Grafana";
  }

  function updateSidebarTitle() {
    const title = getModuleTitle();

    /*
     * En Material for MkDocs, el primer .md-nav__title
     * corresponde normalmente a la navegación lateral.
     */
    const sidebarTitles = document.querySelectorAll(".md-sidebar--primary .md-nav__title");

    if (sidebarTitles.length > 0) {
      sidebarTitles[0].textContent = title;
      return;
    }

    /*
     * Compatibilidad con páginas o versiones donde el título
     * se encuentra directamente dentro del menú principal.
     */
    const primaryNavigation = document.querySelector(".md-sidebar--primary");

    if (primaryNavigation) {
      const fallbackTitle = primaryNavigation.querySelector(".md-nav__title");

      if (fallbackTitle) {
        fallbackTitle.textContent = title;
      }
    }
  }

  function initialize() {
    updateSidebarTitle();

    /*
     * Material puede actualizar la navegación después de cargar la página.
     */
    setTimeout(updateSidebarTitle, 100);
    setTimeout(updateSidebarTitle, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();