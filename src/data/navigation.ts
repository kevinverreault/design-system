const NavigationItems : NavigationItem[] = [
  {
    text: "Accueil",
    path: "/"
  }, 
  {
    text: "À propos",
    subMenuLinks: [
      {
        path: "/",
        text: "Bio"
      }, {
        path: "/",
        text: "Projets"
      }
    ]
  }, 
  {
    text: "Portfolio",
    subMenuLinks: [
      {
        path: "/",
        text: "Oiseaux"
      }, {
        path: "/",
        text: "Mammifères"
      }, {
        path: "/",
        text: "Paysages"
      }
    ]
  }, 
  {
    text: "Boutique",
    path: "/",
    subMenuLinks: [
      {
        path: "/",
        text: "Impressions"
      }, {
        path: "/",
        text: "Calendriers"
      }
    ]
  }, 
  {
    text: "Contact",
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
