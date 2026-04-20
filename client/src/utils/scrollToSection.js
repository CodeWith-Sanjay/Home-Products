export const scrollToSection = (id, navigate) => {
    if(window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);

        if(element) {
          window.scrollTo({
            top: element.offsetTop - 35,
            behavior: 'smooth'
          })
        }
      }, 300) 
    } else {
      const element = document.getElementById(id);

      if(element) {
        window.scrollTo({
          top: element.offsetTop - 35,
          behavior: 'smooth'
        })
      }
    }
}