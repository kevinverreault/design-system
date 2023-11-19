const NavigationItems : NavigationItem[] = [
  {
    text: "À propos",
    subMenuLinks: [
      {
        path: "/",
        text: "Notre mission"
      }, {
        path: "/",
        text: "Observation des oiseaux"
      }, {
        path: "/",
        text: "Nos succès"
      }
    ]
  }, 
  {
    text: "Information",
    subMenuLinks: [
      {
        path: "/",
        text: "Cartes"
      }, {
        path: "/",
        text: "Biodiversité"
      }, {
        path: "/",
        text: "Historique"
      }
    ]
  }, 
  {
    text: "Activités",
    subMenuLinks: [
      {
        path: "/",
        text: "Cartes"
      }, {
        path: "/",
        text: "Biodiversité"
      }, {
        path: "/",
        text: "Historique"
      }
    ]
  }, 
  {
    text: "Actualités",
    path: "/",
    subMenuLinks: [
      {
        path: "/",
        text: "Cartes"
      }, {
        path: "/",
        text: "Biodiversité"
      }, {
        path: "/",
        text: "Historique"
      }
    ]
  }, 
  {
    text: "Nous appuyer",
    path: "/"
  }
]

type NavigationItem = {
  text: string;
  path?: string;
  subMenuLinks?: NavigationMenuLink[]
}

type NavigationMenuLink = {
  text: string;
  path: string;
}

export { NavigationItems };
export type { NavigationItem , NavigationMenuLink  };
