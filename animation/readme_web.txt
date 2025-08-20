# Guide d'intégration des animations 360° - Version Web #

Bienvenue dans le dossier de votre animation en 360° générée avec 360PIK. Ce guide vous aidera à intégrer correctement votre animation sur votre site web.

## À propos de la version Webeee ##

Si vous avez choisi la version Web pour télécharger votre animation, il est important de comprendre que les animations de cette version sont dépendantes d'Internet. Les liens à l'intérieur du fichier HTML de l'animation pointent vers des ressources en ligne. Cela signifie que, sans une connexion Internet, l'animation ne fonctionnera pas. Assurez-vous que vos visiteurs soient informés de cette dépendance ou envisagez d'utiliser notre version Autonome pour une expérience hors ligne.

## Prérequis ##

Avant d'intégrer votre animation, assurez-vous de l'avoir d'abord hébergée sur un serveur ou une plateforme accessible en ligne. Cela garantira que votre animation est accessible chaque fois que votre site est visité.


## Intégration via iframe ##

L'utilisation d'une balise `iframe` est la méthode recommandée pour intégrer votre animation. Elle permet d'encapsuler votre animation comme une page web autonome au sein de votre site.

### Code d'intégration :


<iframe class="respo-iframe" 
        sandbox="allow-scripts allow-same-origin allow-popups allow-top-navigation allow-popups-to-escape-sandbox" 
        allow="fullscreen" 
        frameborder="0" 
        src="URL_VERS_VOTRE_ANIMATION" 
        style="width: 100%; position: absolute; top: 0; left: 0;" 
        loading="lazy">
</iframe>


Remplacez `URL_VERS_VOTRE_ANIMATION` par l'URL exacte où votre animation est hébergée.

### Explication des attributs ###:

- class="respo-iframe" : Classe CSS pour des styles potentiels.
- sandbox : Sécurise le contenu de l'iframe en appliquant des restrictions.
- allow="fullscreen" : Permet au contenu d'aller en mode plein écran.
- frameborder="0" : Supprime les bordures de l'iframe.
- src : L'URL de votre animation.
- style : Défini la taille et la position de l'iframe.
- loading="lazy" : Optimalise le chargement de l'iframe.


## Intégration directe ##

Si vous préférez ne pas utiliser l'iframe, il est possible d'intégrer le code HTML de l'animation directement dans le code de votre site. Pour ce faire :

1. Ouvrez le fichier HTML de votre animation avec un éditeur de texte.
2. Copiez tout le contenu.
3. Collez-le à l'endroit souhaité dans le code source de votre site web.

Note : Cette méthode n'est pas recommandée car elle pourrait causer des conflits avec d'autres éléments de votre site, notamment en termes de styles CSS et de scripts JavaScript.

## Adaptation à votre design ##

Pour s'assurer que l'animation s'intègre harmonieusement dans le design de votre site, il peut être nécessaire d'ajuster ses dimensions. Voici un exemple montrant comment définir des dimensions spécifiques pour votre animation :


.respo-iframe {
    width: 500px;
    height: 300px;
}


Dans cet exemple, la largeur de l'animation est définie à 500 pixels et la hauteur à 300 pixels. Vous pouvez modifier ces valeurs en fonction de l'espace disponible sur votre site. Assurez-vous de tester l'affichage de l'animation dans différents navigateurs pour garantir une compatibilité optimale.

Note: Si vous avez intégré votre animation directement (sans iframe), appliquez les styles CSS directement à la classe ou à l'ID de l'élément conteneur de votre animation.

## Besoin d'aide supplémentaire ? ##

Si vous rencontrez des problèmes ou avez des questions, n'hésitez pas à contacter notre support technique à [jean-paul@rembrandt360.ca].



