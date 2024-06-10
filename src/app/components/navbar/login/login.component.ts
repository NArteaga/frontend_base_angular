import { ThemeService } from '@common/theme.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'navbar-login',
  standalone: true,
  imports: [ToolbarModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class NavbarLoginComponent implements OnInit {
  @Output() onLogo: EventEmitter<any> = new EventEmitter();

  theme = 'sun'

  constructor(
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const theme = this.themeService.getTheme()
    this.theme = theme === 'dark' ? 'moon' : 'sun'
  }

  changeTheme() {
    const theme = this.themeService.setTheme()
    this.theme = theme === 'dark'? 'moon' : 'sun'
  }

  logo() {
    this.onLogo.emit()
  }
}
