import { Component, OnInit, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { User, UserStore } from './app/store/user.store';
import { WorkOrder, WorkOrderStore } from './app/store/work-order.store';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <h1>Hello from {{ name }}!</h1>
    
    <h2>Work Orders with User Data</h2>
    <button (click)="loadWorkOrdersAndUsers()">Load Work Orders and Users</button>
    <p *ngIf="workOrderStore.isLoading() || userStore.isLoading()">Loading data...</p>
    <ul *ngIf="!workOrderStore.isLoading() && !userStore.isLoading()">
      <li *ngFor="let workOrder of workOrderStore.workOrders()">
        {{ workOrder.title }} - {{ workOrder.status }}
        <br>
        Assigned to: {{ getUserFullName(workOrder.userId) }}
        <button (click)="updateWorkOrderStatus(workOrder)">Update Status</button>
      </li>
    </ul>
    <p>Completed Work Orders: {{ workOrderStore.completedWorkOrders().length }}</p>
    
    <br><br>
    <a target="_blank" href="https://angular.dev/overview">
      Learn more about Angular
    </a>
  `,
})
export class App implements OnInit {
  name = 'Angular with NgRx Signal Store';
  userStore = inject(UserStore);
  workOrderStore = inject(WorkOrderStore);

  ngOnInit() {
    this.loadWorkOrdersAndUsers();
  }

  loadWorkOrdersAndUsers() {
    this.workOrderStore.loadWorkOrders();
    this.workOrderStore.workOrders.subscribe(workOrders => {
      const userIds = [...new Set(workOrders.map(wo => wo.userId))];
      this.userStore.loadUsers(userIds);
    });
  }

  updateWorkOrderStatus(workOrder: WorkOrder) {
    const newStatus = workOrder.status === 'open' ? 'in-progress' : 
                      workOrder.status === 'in-progress' ? 'completed' : 'open';
    const updatedWorkOrder = { ...workOrder, status: newStatus };
    this.workOrderStore.updateWorkOrder(updatedWorkOrder);
  }

  getUserFullName(userId: number): string {
    const user = this.userStore.getUserById()(userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}

bootstrapApplication(App);