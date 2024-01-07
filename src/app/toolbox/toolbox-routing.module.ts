import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { FaqComponent } from './faq/faq.component';
import { ToolboxComponent } from './toolbox.component';


const toolboxRoutes: Routes = [
    {
        path: 'toolbox', component: ToolboxComponent, children: [
            { path: 'toolbox/contact', component: ContactComponent },
            { path: 'toolbox/faq', component: FaqComponent },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(toolboxRoutes)],
    exports: [RouterModule]
})
export class ToolboxRoutingModule { }
