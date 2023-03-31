import React, { Component } from "react";

import {
  Tag, Content, Header, HeaderMenuButton, HeaderName, HeaderNavigation,
  HeaderGlobalBar, HeaderPanel, SwitcherItem, SwitcherDivider,
  SkipToContent, SideNav, SideNavItems, SideNavMenu, SideNavMenuItem,
  HeaderContainer, Toggle, ToastNotification,
} from 'carbon-components-react';

import {
  BrowserRouter, Link,
} from "react-router-dom";

import ErrorBoundary from "../ErrorBoundary";
import AppRoutes from "../AppRoutes";

import { HeaderGlobalAction } from "carbon-components-react/lib/components/UIShell";
import {
  Launch16, UserAvatar20, Login20, Locked16, Logout20 as Logout,
  TaskComplete20, Copy20
} from '@carbon/icons-react';

import b64 from "../../utils/b64";
import ApplicationMode from "../../utils/application-mode";

const defaultConfig = {
  complianceFeatures: false,
  builderFeatures: true,
  ibmContent: true,
  azureContent: true,
  awsContent: true,
}

class UIShell extends Component {

  constructor(props) {
    super(props);
    this.state = {
      copyTokenIcon: <Copy20 />,
      user: undefined,
      activeItem: `/${window.location.pathname.split('/')[1] ?? ''}`,
      builderExpended: true,
      complianceExpended: true,
      docsExpended: false,
      patternName: "Overview",
      profileExpanded: false,
      content: defaultConfig,
      notifications: []
    };
  }

  async redirectToLogin() {
    window.location.href = "/login";
  }

  async setContent(content) {
    if (this.state?.user?.email) {
      fetch(`/api/users/${this.state.user.email}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ config: content })
      })
        .then(res => res.json())
        .then(user => { if (user.email) this.setState({ content: user.config, user: { ...this.state.user, config: user.config } }) })
        .catch(console.error)
    }
  }

  addNotification(type, message, detail) {
    this.setState(prevState => ({
      notifications: [
        ...prevState.notifications,
        {
          message: message || "Notification",
          detail: detail || "Notification text",
          severity: type || "info"
        }
      ]
    }));
  }

  renderNotifications() {
    return this.state.notifications.map(notification => {
      return (
        <ToastNotification
          title={notification.message}
          subtitle={notification.detail}
          kind={notification.severity}
          timeout={10000}
          caption={false}
        />
      );
    });
  }

  async componentDidMount() {
    fetch('/userDetails')
      .then(res => res.json())
      .then(user => {
        if (user.email) {
          setTimeout(() => {
            // Session expired, redirecting to login
            window.location.reload(false);
          }, (new Date(user?.sessionExpire)).getTime() - Date.now());
          this.setState({ user: user || undefined });
          fetch(`/api/users/${this.state.user.email}`)
            .then(res => res.json())
            .then(userInfo => {
              if (userInfo.config) this.setState({ content: userInfo.config, user: { ...user, config: userInfo.config } });
              else {
                this.setState({ user: { ...user, config: defaultConfig } });
                this.setContent(defaultConfig);
              }
            })
            .catch(console.error);
        } else {
          console.log(user);
        }
      })
      .catch(console.error);
  }

  fetchToken() {
    fetch('/api/token')
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          navigator.clipboard.writeText(b64.decode(res.token));
          this.setState({ copyTokenIcon: <TaskComplete20 /> });
          setTimeout(() => {
            this.setState({ copyTokenIcon: <Copy20 /> });
          }, 2000);
        }
      })
      .catch(console.error);
  }

  render() {
    return (
      <BrowserRouter>
        <HeaderContainer
          render={({ isSideNavExpanded, onClickSideNavExpand }) => (


            <Header aria-label="IBM">
            
              <SkipToContent />

              <HeaderMenuButton
                aria-label="Open menu"
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
              />
              {/* <div >
              <a href="/" class="navheader_logo" aria-label="PepsiCo Home Logo">
                    <svg class="headsvg" tabindex="0" viewBox="0 0 590.666 164"><path clip-rule="evenodd" d="M155.234,102.004h13.325c5.199,0,7.176,1.794,7.176,6.188c0,4.231-1.978,6.023-7.176,6.023h-13.325V102.004L155.234,102.004z M134.591,146.447h20.644v-18.072h22.112c14.64,0,19.911-8.624,19.911-19.774c0-12.943-5.42-20.267-20.06-20.267h-42.607V146.447L134.591,146.447z"></path><polygon clip-rule="evenodd" points="204.066,88.334 259.627,88.334 259.627,102.493 224.71,102.493 224.71,110.307 257.142,110.307 257.142,124.472 224.71,124.472 224.71,132.285 259.627,132.285 259.627,146.447 204.066,146.447 204.066,88.334"></polygon><path clip-rule="evenodd" d="M288.912,102.004h13.324c5.198,0,7.176,1.794,7.176,6.188c0,4.231-1.978,6.023-7.176,6.023h-13.324V102.004L288.912,102.004z M268.268,146.447h20.644v-18.072h22.108c14.644,0,19.916-8.624,19.916-19.774c0-12.943-5.42-20.267-20.063-20.267h-42.605V146.447L268.268,146.447z"></path><path clip-rule="evenodd" d="M350.918,121.785c-10.101-1.712-14.271-8.223-14.271-16.36c0-15.06,13.251-19.126,30.231-19.126c23.277,0,32.869,6.753,33.602,19.045h-24.013c0-2.361-1.245-3.829-3.145-4.642c-1.831-0.893-4.172-1.218-6.444-1.218c-6.149,0-8.27,1.707-8.27,4.151c0,1.625,0.656,2.687,2.706,3.011l24.67,4.068c10.397,1.709,16.84,7.081,16.84,16.927c0,14.167-10.396,20.841-33.604,20.841c-15.885,0-33.236-2.441-33.308-19.534h24.89c0.07,1.951,0.732,3.253,2.198,4.149c1.533,0.815,3.804,1.223,7.024,1.223c6.441,0,8.201-1.955,8.201-4.723c0-1.709-0.954-3.417-3.73-3.903L350.918,121.785L350.918,121.785z"></path><polygon clip-rule="evenodd" points="409.556,88.334 430.199,88.334 430.199,146.447 409.556,146.447 409.556,88.334"></polygon><path clip-rule="evenodd" d="M506.706,123.82c-1.318,7.651-3.664,13.837-8.789,18.068c-5.048,4.233-12.957,6.594-25.546,6.594c-12.518,0-35.725-0.979-35.725-31.09c0-30.117,23.207-31.094,35.725-31.094c12.442,0,31.624,1.789,34.335,24.826h-23.28c-0.586-4.155-3.079-10.177-11.055-10.177c-8.423,0-13.766,4.639-13.766,16.444c0,11.802,5.199,16.438,12.739,16.438c6.517,0,10.397-3.011,12.081-10.01H506.706L506.706,123.82z"></path><path clip-rule="evenodd" d="M533.717,117.393c0-11.806,5.346-16.444,13.766-16.444c8.417,0,13.764,4.639,13.764,16.444c0,11.802-5.347,16.438-13.764,16.438C539.063,133.83,533.717,129.194,533.717,117.393L533.717,117.393z M511.753,117.393c0,30.11,23.207,31.09,35.729,31.09c12.519,0,35.726-0.979,35.726-31.09c0-30.117-23.207-31.094-35.726-31.094C534.96,86.299,511.753,87.275,511.753,117.393L511.753,117.393z"></path><path clip-rule="evenodd" d="M103.397,88.91c1.333-27.881-22.711-59.279-55.49-63.16l0.056-0.381c32.315,0,57.088,29.916,57.088,53.517c-0.031,4.913-0.419,7.957-1.111,10.167L103.397,88.91L103.397,88.91zM101.439,92.454c-2.15,2.627-4.854,5.272-8.022,7.783c-5.828-33.519-30.459-62.829-47.873-71.384l-0.373,0.26c17.513,14.373,38.401,42.288,46.524,72.439c-3.886,2.864-8.378,5.5-13.341,7.64C61.828,90.346,46.421,54,41.456,30.936l-0.505,0.152c0.112,22.388,16.007,60.394,35.391,78.939c-4.302,1.697-8.928,3.02-13.786,3.809c-18.581-7.361-31.807-30.937-31.807-55.088c0-15.766,4.807-25.519,5.737-27.515l-0.396-0.157c-1.125,1.702-8.167,11.45-8.167,28.471c0,27.299,13.463,48.165,31.337,54.736c-6.115,0.665-12.55,0.464-19.152-0.899l-0.133,0.416c1.912,0.704,8.399,3.427,18.295,3.427c22.383,0,37.514-13.907,43.605-24.478L101.439,92.454L101.439,92.454z"></path><path clip-rule="evenodd" d="M56.032,15.518c-16.968,0-36.864,12.246-36.864,23.44c0,4.33,3.961,7.988,12.159,7.988c19.031,0,36.712-13.075,36.712-23.242C68.039,18.354,62.901,15.518,56.032,15.518L56.032,15.518zM62.806,23.388c0,8.57-16.457,19.046-30.214,19.046c-6.078,0-9.362-2.392-9.362-6.339c0-8.693,16.644-18.991,29.548-18.991C61.191,17.104,62.806,21.385,62.806,23.388L62.806,23.388z"></path><path clip-rule="evenodd" d="M12.408,44.141c-0.477,0.825-2.387,4.565-2.387,8.397c0,7.107,7.181,13.705,20.389,13.705c25.409,0,54.765-18.703,54.765-36.064c0-7.793-7.377-12.03-12.499-12.906l-0.096,0.304c1.593,0.504,7.429,3.217,7.429,10.159c0,13.833-25.919,32.681-51.737,32.681c-9.884,0-16.111-4.879-16.111-11.986c0-2.248,0.468-3.729,0.592-4.158L12.408,44.141L12.408,44.141z"></path><path clip-rule="evenodd" d="M95.651,31.477c0.697,0.529,4.882,4.017,4.882,10.613c0,22.49-35.238,44.605-66.391,44.605c-18.578,0-27.047-9.173-26.672-17.318h0.333c0.728,4.23,6.76,11.799,23.02,11.799c31.192,0,66.019-22.883,66.019-42.932c0-3.439-0.934-5.582-1.462-6.535L95.651,31.477L95.651,31.477z"></path><path clip-rule="evenodd" d="M107.429,52.473c0.146,0.479,0.905,2.632,0.905,6.004c0,25.018-35.661,46.436-66.676,46.436c-15.963,0-24.299-7.754-26.059-10.903l0.284-0.21c4.417,3.863,13.117,6.798,23.27,6.798c27.392,0,68.265-20.84,67.9-48.034L107.429,52.473L107.429,52.473z"></path></svg>
               
                </a>

                </div> */}
              <HeaderName prefix={ApplicationMode.isFsControlsMode() ? 'IBM Cloud' : 'PepsiCo Super Cloud'}>
                {ApplicationMode.isFsControlsMode() ? 'Controls Catalog' : 'Deployer'}
              </HeaderName>
              <HeaderNavigation aria-label="navigation">
              </HeaderNavigation>
              <HeaderGlobalBar>
                {this.state.user ?
                  <HeaderGlobalAction
                    aria-label="Profile"
                    isActive={this.state.profileExpanded}
                    onClick={() => this.setState({ profileExpanded: !this.state.profileExpanded })}
                    tooltipAlignment="end">
                    <UserAvatar20 />
                  </HeaderGlobalAction>
                  :
                  <HeaderGlobalAction
                    aria-label="Login / Register"
                    onClick={this.redirectToLogin}
                    tooltipAlignment="end">
                    <Login20 />
                  </HeaderGlobalAction>
                }
              </HeaderGlobalBar >
              <HeaderPanel aria-label="Header Panel" className="user-profile" expanded={this.state.profileExpanded} style={{ bottom: 'auto', paddingBottom: '1rem', listStyleType: 'none' }}>
                <li className="bx--switcher__item title">
                  <strong>{(this.state.user && this.state.user.name) || "Username"}</strong>
                  <Tag>{(this.state.user?.role) || "role"}</Tag>
                </li>
                <li className="bx--switcher__item"><strong>{(this.state.user?.email) || "example@ibm.com"}</strong></li>
                {this.state.user?.role === 'admin' ? <li className="bx--switcher__item">
                  <strong>region:</strong>
                  <Tag style={{ marginLeft: '.5rem' }}>{this.state.user?.region}</Tag>
                </li> : <></>}
                {ApplicationMode.isBuilderMode() ? <div>
                  <SwitcherDivider />
                  <SwitcherItem aria-label="API token" onClick={this.fetchToken.bind(this)}>
                    <span>API token</span>{this.state.copyTokenIcon}
                  </SwitcherItem>
                </div>

                    : <></>}



                {ApplicationMode.isBuilderMode() && this.state.user?.role === 'admin' ?

                  <div>
                  <SwitcherDivider />

                    <li className="bx--switcher__item">
                    <Toggle labelText="Compliance features" size="md" id='compliance-toggle' toggled={this.state.content.complianceFeatures} onToggle={(checked) => this.setContent({ ...this.state.content, complianceFeatures: checked })} />
                  </li>
                  <li className="bx--switcher__item">
                    <Toggle labelText="Solution Builder features" size="md" id='builder-toggle' toggled={this.state.content.builderFeatures} onToggle={(checked) => this.setContent({ ...this.state.content, builderFeatures: checked })} />
                  </li>
                  </div>  : <></>}


                {ApplicationMode.isBuilderMode() && this.state.user?.role === 'admin' ? <>
                  <li className="bx--switcher__item">
                    <Toggle labelText="Azure content" size="sm" id='azure-toggle' toggled={this.state.content.azureContent} onToggle={(checked) => this.setContent({ ...this.state.content, azureContent: checked })} />
                  </li>
                  <li className="bx--switcher__item">
                    <Toggle labelText="AWS content" size="sm" id='aws-toggle' toggled={this.state.content.awsContent} onToggle={(checked) => this.setContent({ ...this.state.content, awsContent: checked })} />
                  </li>
                </> : <></>}

                <SwitcherDivider />
                <SwitcherItem aria-label="Logout" className="logout" href="/logout">
                  <span>Logout</span>
                  <Logout />
                </SwitcherItem>
              </HeaderPanel>
              <ErrorBoundary>
                <SideNav aria-label="Side navigation" expanded={isSideNavExpanded} >

                  <SideNavItems>

                    <SideNavMenuItem element={Link} to='/'
                      isActive={this.state.activeItem === '/'}
                      onClick={() => {
                        this.setState({ activeItem: '/' })
                      }}>
                      {ApplicationMode.isFsControlsMode() ? 'Controls Catalog' : 'Overview'}
                    </SideNavMenuItem>

                    {ApplicationMode.isBuilderMode() ? <SideNavMenu defaultExpanded title="Solutions">

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/solutions/user'
                          isActive={this.state.activeItem === '/solutions/user'}
                          onClick={() => { this.setState({ activeItem: '/solutions/user' }) }}>Created Solutions</SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/solutions/user'>
                          Created Solutions
                          <Locked16 style={{ marginLeft: "auto" }} />
                        </SideNavMenuItem>
                      }

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/solutions'
                          isActive={this.state.activeItem === '/solutions'}
                          onClick={() => { this.setState({ activeItem: '/solutions' }) }}>Public Solutions</SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/solutions'>
                          Solutions
                          <Locked16 style={{ marginLeft: "auto" }} />
                        </SideNavMenuItem>
                      }

                    </SideNavMenu> : <></>}

                    {ApplicationMode.isBuilderMode() ? <SideNavMenu title="Reference Architectures" defaultExpanded
                      isActive={['/solutions', '/boms', '/services'].includes(this.state.activeItem)}>

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/boms/infrastructure'
                          isActive={this.state.activeItem === '/boms/infrastructure'}
                          onClick={() => { this.setState({ activeItem: '/boms/infrastructure' }) }}>Infrastructure</SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/boms/infrastructure'>
                          Infrastructure
                          <Locked16 style={{ marginLeft: "auto" }} />
                        </SideNavMenuItem>
                      }

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/boms/software'
                          isActive={this.state.activeItem === '/boms/software'}
                          onClick={() => { this.setState({ activeItem: '/boms/software' }) }}>Software</SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/boms/software'>
                          Software
                          <Locked16 style={{ marginLeft: "auto" }} />
                        </SideNavMenuItem>
                      }


                    </SideNavMenu> : <></>}

                    <SideNavMenu title="Compliance" defaultExpanded
                      isActive={['/onboarding', '/controls', '/mapping', '/nists'].includes(this.state.activeItem)} >

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/controls'
                          isActive={this.state.activeItem === '/controls'}
                          onClick={() => { this.setState({ activeItem: '/controls' }) }}>Controls</SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/controls'>
                          Controls
                          <Locked16 />
                        </SideNavMenuItem>
                      }

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/mapping'
                          isActive={this.state.activeItem === '/mapping'}
                          onClick={() => { this.setState({ activeItem: '/mapping' }) }}>Mapping</SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/mapping'>
                          Mapping
                          <Locked16 />
                        </SideNavMenuItem>
                      }

                      {this.state.user ?
                        <SideNavMenuItem element={Link} to='/nists'
                          isActive={this.state.activeItem === '/nists'}
                          onClick={() => { this.setState({ activeItem: '/nists' }) }}>
                          NIST 800-53
                        </SideNavMenuItem>
                        :
                        <SideNavMenuItem href='/nists'>
                          NIST 800-53
                          <Locked16 />
                        </SideNavMenuItem>
                      }

                    </SideNavMenu>

                    {ApplicationMode.isBuilderMode() ? <SideNavMenu title="Automation Catalog">

                      {this.state?.user?.email?.endsWith('ibm.com') ? <SideNavMenuItem
                        href="https://pages.github.ibm.com/Ondrej-Svec2/ibm-software-map"
                        target="_blank" rel="noopener noreferrer">
                        IBM Software Portfolio
                        <Launch16 />
                      </SideNavMenuItem> : <></>}

                      <SideNavMenuItem href="https://modules.techzone.ibm.com"
                        target="_blank" rel="noopener noreferrer">
                        Automation Modules
                        <Launch16 />
                      </SideNavMenuItem>

                      <SideNavMenuItem href="https://github.com/cloud-native-toolkit/software-everywhere/issues/new?assignees=seansund&labels=new_module&template=new-module.md&title=Request+new+module%3A+%7Bname%7D"
                        target="_blank" rel="noopener noreferrer">
                        Create a Module
                        <Launch16 />
                      </SideNavMenuItem>

                    </SideNavMenu> : <></>}


                    {ApplicationMode.isBuilderMode() ? <SideNavMenu title="Documentation"
                      isSideNavExpanded={isSideNavExpanded}
                      defaultExpanded={['/docs'].includes(this.state.activeItem)}
                      isActive={['/docs'].includes(this.state.activeItem)} >
                      {this.state?.user?.email?.endsWith('ibm.com') ?
                        <SideNavMenuItem element={Link} to='/docs'
                          isActive={this.state.activeItem === '/docs'}
                          onClick={() => { this.setState({ activeItem: '/docs', docsExpended: true }) }}>About</SideNavMenuItem>
                        : <></>}
                      <SideNavMenuItem href="https://www.ibm.com/training/cloud/jobroles"
                        target="_blank" rel="noopener noreferrer">
                        Free IBM Cloud Training
                        <Launch16 />
                      </SideNavMenuItem>
                      <SideNavMenuItem href="https://landscape.cncf.io/"
                        target="_blank" rel="noopener noreferrer">
                        Cloud-Native Landscape
                        <Launch16 />
                      </SideNavMenuItem>
                      <SideNavMenuItem href="https://cloudnativetoolkit.dev/"
                        target="_blank" rel="noopener noreferrer">
                        Cloud-Native Toolkit
                        <Launch16 />
                      </SideNavMenuItem>
                      <SideNavMenuItem
                        href="https://github.com/cloud-native-toolkit/iascable"
                        target="_blank" rel="noopener noreferrer">
                        Builder CLI
                        <Launch16 />
                      </SideNavMenuItem>

                      <SideNavMenuItem href="https://modules.techzone.ibm.com/#/how-to/gitops"
                        target="_blank" rel="noopener noreferrer">
                        Create a GitOps Module
                        <Launch16 />
                      </SideNavMenuItem>

                      <SideNavMenuItem href="https://modules.techzone.ibm.com/#/how-to/terraform"
                        target="_blank" rel="noopener noreferrer">
                        Create a Terraform Module
                        <Launch16 />
                      </SideNavMenuItem>

                    </SideNavMenu>  : <></>}

                    {ApplicationMode.isBuilderMode() ? <SideNavMenu title="Join Us" >
                      <SideNavMenuItem
                        href="https://github.com/cloud-native-toolkit"
                        target="_blank" rel="noopener noreferrer">
                        Git Organization
                        <Launch16 />
                      </SideNavMenuItem>

                      <SideNavMenuItem
                        href="https://discord.gg/7sSY9W2cZf"
                        target="_blank" rel="noopener noreferrer">
                        Discord Community
                        <Launch16 />
                      </SideNavMenuItem>

                      <SideNavMenuItem
                        href="https://www.youtube.com/c/CloudNativeToolkit"
                        target="_blank" rel="noopener noreferrer">
                        Youtube Channel
                        <Launch16 />
                      </SideNavMenuItem>
                    </SideNavMenu>  : <></>}

                    {ApplicationMode.isBuilderMode() ?

                    <SideNavMenuItem
                      href="https://github.com/cloud-native-toolkit/software-everywhere/issues/new?assignees=NoeSamaille&labels=ascent&template=issue-bug-report-on-ascent-tool.md&title=Issue+on+Ascent%3A+%7Bissue%7D"
                      target="_blank" rel="noopener noreferrer">
                      An Issue?
                      <Launch16 />
                    </SideNavMenuItem> :

                    <SideNavMenuItem
                        href="https://github.com/cloud-native-toolkit/software-everywhere/issues/new?assignees=NoeSamaille&labels=controls&template=controls-issue.md&title=Issue+on+Controls%3A+%7Bissue%7D"
                        target="_blank" rel="noopener noreferrer">
                      An Issue?
                      <Launch16 />
                    </SideNavMenuItem> }

                  </SideNavItems>
                </SideNav>
              </ErrorBoundary>
            </Header>
          )}
        />
        <Content onClick={() => {
          if (this.state.profileExpanded) this.setState({ profileExpanded: false })
        }}>

          <div className='notif'>
            {this.state.notifications.length !== 0 && this.renderNotifications()}
          </div>

          <AppRoutes user={this.state.user} addNotification={this.addNotification.bind(this)} />

        </Content>
      </BrowserRouter>
    );
  }
}

export default UIShell;
