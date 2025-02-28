import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import logo from '../../assets/logos/color-logo.png';
import styles from './Navbar.module.css'; 

function NavigationBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar 
      expanded={expanded} 
      expand="md" 
      className={styles.navbarCustom} 
      fixed="top"
    >
      <div className={styles.navbarContainer}>
        <Navbar.Brand href="#home" className={styles.navbarBrand}>
          <img 
            src={logo} 
            height="40" 
            className="d-inline-block align-top" 
            alt="MRUHacks Logo" 
          />
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")} 
          className={styles.navbarToggler}
        />
        <Navbar.Collapse id="basic-navbar-nav" className={styles.navbarCollapse}>
          <Nav className={styles.navContainer}>
            <Nav.Link href="#about" onClick={() => setExpanded(false)} className={styles.navLink}>About</Nav.Link>
            <Nav.Link href="#register" onClick={() => setExpanded(false)} className={styles.navLink}>Register</Nav.Link>
            <Nav.Link href="#faq" onClick={() => setExpanded(false)} className={styles.navLink}>FAQ</Nav.Link>
            <Nav.Link href="#sponsors" onClick={() => setExpanded(false)} className={styles.navLink}>Sponsors</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default NavigationBar;