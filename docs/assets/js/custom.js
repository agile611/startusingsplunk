(function () {
  "use strict";

  const modules = [
    {
      path: "curso",
      title: "El curso"
    },
    {
      path: "sesion-1",
      title: "Fundamentos e ingestión"
    },
    {
      path: "sesion-2",
      title: "Lenguaje SPL"
    },
    {
      path: "sesion-3",
      title: "Dashboards y alertas"
    },
    {
      path: "proyecto",
      title: "Proyecto final"
    },
    {
      path: "referencia",
      title: "Referencia"
    },
    {
      path: "troubleshooting",
      title: "Solución de problemas"
    }
  ];

  function getModuleTitle() {
    const path = window.location.pathname;

    const selectedModule = modules.find(function (module) {
      return path.includes("/" + module.path + "/");
    });

    return selectedModule ? selectedModule.title : "Curso de Splunk";
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